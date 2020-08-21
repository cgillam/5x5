const Workout = require("../models/Workout")

const exercises = [
    [{
        _id: '0',
        title: 'Squat',
        buffer: 3000,
        stages: [{ action: 'Squat', duration: 400 }, { action: 'Raise', duration: 200 }, { action: 'Reset', duration: 400 }],
    }], [{
        _id: '1',
        title: 'Bench',
        buffer: 3000,
        stages: [{ action: 'Lower', duration: 400 }, { action: 'Pause', duration: 200 }, { action: 'Raise', duration: 400 }],
    }, {
        _id: '11',
        title: 'Press',
        buffer: 3000,
        stages: [{ action: 'Lower', duration: 400 }, { action: 'Pause', duration: 200 }, { action: 'Raise', duration: 400 }],
    }], [{
        _id: '2',
        title: 'Row',
        buffer: 3000,
        stages: [{ action: 'Raise', duration: 400 }, { action: 'Lower', duration: 200 }, { action: 'Reset', duration: 400 }],
    }, {
        _id: '22',
        title: 'Deadlift',
        buffer: 3000,
        stages: [{ action: 'Raise', duration: 400 }, { action: 'Lower', duration: 200 }, { action: 'Reset', duration: 400 }],
    }]
];

const defaultNextPayload = ({
    exercises: exercises.map(pool => pool[0]),
    weights: new Array(exercises.length).fill(null)
});


exports.next = async (req, res) => {
    if (!req.user) return res.json(defaultNextPayload);


    const oldest = new Date(Date.now() - 604800000);
    const weekWorkouts = await Workout.find({
        user: req.user,
        createdAt: { $gt: oldest }
    }).sort({ createdAt: -1, });

    if (weekWorkouts.length >= 3) return res.json({ exercises: [], weights: [] });

    const currentDay = new Date().getDate();
    const todayWorkout = weekWorkouts.find(workout => workout.createdAt.getDate() === currentDay);
    // todo - debug
    //if (todayWorkout) return res.json({ exercises: [], weights: [] });

    const lastTwo = await Workout.find({
        user: req.user,
    })/*.populate('exercises')*/.sort({ createdAt: -1 }).limit(2);
    if (!lastTwo.length) return res.json(defaultNextPayload);

    const lastExerciseIDs = lastTwo[0].exercises.map(exercise => /*exercise._id*/exercise);

    const nextExercises = lastExerciseIDs.map((_id, i) => {
        const poolIndex = exercises[i].findIndex(exercise => exercise._id === _id);
        return exercises[i][(poolIndex + 1) % exercises[i].length];
    });

    const lastExercisesWeights = nextExercises.map((exercise, i) => {
        let lastWorkout;
        for (const workout of lastTwo) {
            if (!workout.exercises.find(workoutExercise => /*workoutExercise._id*/workoutExercise === exercise._id)) continue;
            lastWorkout = workout;
            break;
        }
        console.log(lastWorkout, exercise)
        if (!lastWorkout) return null;
        return lastWorkout.weights[i] + 2.5;
    });

    return res.json({
        exercises: nextExercises,
        weights: lastExercisesWeights
    })
}



exports.submit = async (req, res) => {
    const { exerciseIDs, weights } = req.body;

    await new Workout({ user: req.user, exercises: exerciseIDs, weights }).save()

    return res.status(200).end();
}

exports.history = async (req, res) => {
    const workouts = await Workout.find({ user: req.user });

    return res.json({ workouts: workouts.map(workout => workout.toJSON()) });
}