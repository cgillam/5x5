const Workout = require("../models/Workout")
const WorkOutPlan = require("../models/workouPlan")

const getDefaultWorkouPlan = require("../models/default")
const emptyNext = { planId: null, exercises: [], weights: [] }
const getPlanPayLoad = async (id) => {
    const { _id, exerciseSlots } = id ? await WorkOutPlan.findById(id).populate({ path: 'exerciseSlots', model: "Exercise" }) : await getDefaultWorkouPlan()

    return {
        planId: _id,
        exercises: exerciseSlots.map(pool => pool[0]),
        weights: new Array(exerciseSlots.length).fill(null)
    }
}



exports.next = async (req, res) => {
    const { planId } = req.query

    if (!req.user) return res.json(await getPlanPayLoad(planId));


    const oldest = new Date(Date.now() - 604800000);
    const weekWorkouts = await Workout.find({
        user: req.user,
        createdAt: { $gt: oldest },
        ...(planId ? { plan: planId } : {})
    }).sort({ createdAt: -1, });

    if (weekWorkouts.length >= 3) return res.json(emptyNext);

    const currentDay = new Date().getDate();
    const todayWorkout = weekWorkouts.find(workout => workout.createdAt.getDate() === currentDay);
    // todo - debug
    //if (todayWorkout) return res.json({ exercises: [], weights: [] });

    const lastTwo = await Workout.find({
        user: req.user,
        ...(planId ? { plan: planId } : {})
    }).populate({ path: "plan", populate: { path: 'exerciseSlots', model: "Exercise" } }).populate('exercises').sort({ createdAt: -1 }).limit(2);
    if (!lastTwo.length) return res.json(await getPlanPayLoad(planId));
    const lastWorkout = lastTwo[0];
    const lastExerciseIDs = lastWorkout.exercises.map(exercise => exercise._id);

    const nextExercises = lastExerciseIDs.map((_id, i) => {
        const poolIndex = lastWorkout.plan.exerciseSlots[i].findIndex(exercise => exercise._id.equals(_id));
        return lastWorkout.plan.exerciseSlots[i][(poolIndex + 1) % lastWorkout.plan.exerciseSlots[i].length];
    });

    const lastExercisesWeights = nextExercises.map((exercise, i) => {
        let lastWorkout;
        for (const workout of lastTwo) {
            if (!workout.exercises.find(workoutExercise => workoutExercise._id.equals(exercise._id))) continue;
            lastWorkout = workout;
            break;
        }
        if (!lastWorkout) return null;
        return lastWorkout.weights[i] + 2.5;
    });

    return res.json({
        planId: lastWorkout.plan._id,
        exercises: nextExercises,
        weights: lastExercisesWeights
    })
}



exports.submit = async (req, res) => {
    const { planid, exerciseIDs, weights, comments } = req.body;

    await new Workout({ user: req.user, plan: planid, exercises: exerciseIDs, weights, comments }).save()

    return res.status(200).end();
}

exports.history = async (req, res) => {
    const workouts = (await Workout.find({ user: req.user }).populate({ path: "plan", populate: { path: 'exerciseSlots', model: "Exercise" } })).map(workout => workout.toJSON());

    return res.json({ workouts });
}