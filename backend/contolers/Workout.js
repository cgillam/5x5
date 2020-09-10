const Workout = require("../models/Workout")
const WorkOutPlan = require("../models/workouPlan")

const { getDefault: getDefaultWorkouPlan } = require("../models/default")
// Empty data to return for next endpoint
const emptyNext = { planId: null, exercises: [], weights: [] }

// Get the plan payload of the given ID, or the default plan if not provided
const getPlanPayLoad = async (id) => {
    // If given an ID, find by ID and populate all exercise slots, otherwise get the default plan
    const { _id, exerciseSlots } = id
        ? await WorkOutPlan.findById(id).populate({ path: 'exerciseSlots', model: "Exercise" })
        : await getDefaultWorkouPlan()

    // Return the plan ID, first exercise of each slot, and an empty array of weights to populate
    return {
        planId: _id,
        exercises: exerciseSlots.map(pool => pool[0]),
        weights: new Array(exerciseSlots.length).fill(null)
    }
}


// Return the next exercises for the user
exports.next = async (req, res) => {
    const { planId } = req.query

    // If not logged in, return the first of a plan
    if (!req.user) return res.json(await getPlanPayLoad(planId));


    // If the user has three workouts of this plan this week, return empty data
    // as there can not be more then three workouts of a single plan a week
    const oldest = new Date(Date.now() - 604800000);
    const weekWorkouts = await Workout.find({
        user: req.user,
        createdAt: { $gt: oldest },
        ...(planId ? { plan: planId } : {})
    }).sort({ createdAt: -1, });

    if (weekWorkouts.length >= 3) return res.json(emptyNext);

    // If the user has a workout done today, return empty data
    const currentDay = new Date().getDate();
    const todayWorkout = weekWorkouts.find(workout => workout.createdAt.getDate() === currentDay);
    if (todayWorkout) return res.json(emptyNext);

    // Get the last two workouts of the user for this plan
    const lastTwo = await Workout.find({
        user: req.user,
        ...(planId ? { plan: planId } : {})
    }).populate({ path: "plan", populate: { path: 'exerciseSlots', model: "Exercise" } }).populate('exercises').sort({ createdAt: -1 }).limit(2);
    // If there are no workouts, return new plan payload
    if (!lastTwo.length) return res.json(await getPlanPayLoad(planId));

    // Get the exercise IDs of the last workout
    const lastWorkout = lastTwo[0];
    const lastExerciseIDs = lastWorkout.exercises.map(exercise => exercise._id);

    // Get the next exercise of each exercise pool
    const nextExercises = lastExerciseIDs.map((_id, i) => {
        const poolIndex = lastWorkout.plan.exerciseSlots[i].findIndex(exercise => exercise._id.equals(_id));
        return lastWorkout.plan.exerciseSlots[i][(poolIndex + 1) % lastWorkout.plan.exerciseSlots[i].length];
    });

    // Find the next weight of each of the next exercise by searching the previous workouts
    const lastExercisesWeights = nextExercises.map((exercise, i) => {
        let lastWorkout;
        for (const workout of lastTwo) {
            if (!workout.exercises.find(workoutExercise => workoutExercise._id.equals(exercise._id))) continue;
            lastWorkout = workout;
            break;
        }
        if (!lastWorkout) return null;
        return lastWorkout.weights[i] + 5;
    });

    return res.json({
        planId: lastWorkout.plan._id,
        exercises: nextExercises,
        weights: lastExercisesWeights
    })
}


// Submit completed workout
exports.submit = async (req, res) => {
    const { planid, exerciseIDs, weights, comments, image } = req.body;

    await new Workout({ user: req.user, plan: planid, exercises: exerciseIDs, weights, comments, image }).save()

    return res.status(200).end();
}

// Get all completed workouts
exports.history = async (req, res) => {
    const workouts = (await Workout.find({ user: req.user }).populate({ path: "plan", populate: { path: 'exerciseSlots', model: "Exercise" } })).map(workout => {
        const workoutObj = workout.toJSON();
        // Remove all exercise images to save bandwidth
        workoutObj.plan.exerciseSlots.forEach(slot => slot.forEach(exercise => {
            delete exercise.image;
        }));
        return workoutObj;
    });

    return res.json({ workouts });
}


// Return the weight of the latest squat
exports.nextSquatWeight = async (req, res) => {
    const workouts = await Workout.find({
        user: req.user._id
    }).sort({ createdAt: -1 }).populate('exercises');
    // Find weight of last squat, using a value of 100 if the user has never done a squat
    let weight = 100
    try {
        weight = workouts.map(w => w.exercises.map(({ title }, i) => ({
            title,
            weight: w.weights[i],
        }))).flat().filter(e => e.title === 'Squat')[0].weight;
    } catch (e) { }

    return res.json({ weight });
}