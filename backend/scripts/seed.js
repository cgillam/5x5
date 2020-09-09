const { ENV } = require("../constance.js");
require("dotenv").config({ path: ENV });
const connectDB = require("../models");

const User = require("../models/User");
const Exercise = require("../models/Exercise");
const Workout = require("../models/Workout");
const WorkoutPlan = require("../models/workouPlan");
const Challange = require("../models/Challenge");

const { defaultPlan } = require("../models/default");

(async () => {
    let users = [{
        userName: "abc",
        passWord: (await new User({}).setPassWord("def")).passWord,
        email: 'abc@example.com',
        gender: 'male',
        conversion: 'lb',
        age: 28,
        verification: {
            code: 'jshdflsoausj',
            verified: new Date().setDate(new Date().getDate() - 1)
        },
        referalCode: 'adsfasd',
        visibility: 'public'
    }, {
        userName: 'jill',
        passWord: (await new User({}).setPassWord('pass')).passWord,
        email: 'jill@example.com',
        gender: 'female',
        conversion: 'kg',
        age: 15,
        verification: {
            code: 'jihgfedcba',
            verified: -1
        },
        referalCode: '12345',
        visibility: 'public'
    }, {
        userName: 'henry',
        passWord: (await new User({}).setPassWord('pass')).passWord,
        email: 'henry@example.com',
        gender: 'male',
        conversion: 'kg',
        age: 20,
        verification: {
            code: '1234567890',
            verified: new Date().setDate(new Date().getDate() - 500)
        },
        referalCode: '54321',
        visibility: 'private'
    }];
    await connectDB();
    await User.collection.drop().catch(() => undefined);
    await WorkoutPlan.collection.drop().catch(() => undefined);
    await Exercise.collection.drop().catch(() => undefined);
    await Workout.collection.drop().catch(() => undefined);

    users = await User.insertMany(users);

    let workoutPlans = [defaultPlan, {
        author: users[0]._id,
        exerciseSlots: [[{
            title: 'Exercise',
            buffer: 5000,
            stages: [{ action: 'Up', duration: 4000 }, { action: 'Hold', duration: 2000 }, { action: 'Down', duration: 4000 }]
        }]]
    }, {
            author: users[1]._id,
            exerciseSlots: [
                [{
                    title: 'Exercise A1',
                    buffer: 5000,
                    stages: [{ action: 'Up', duration: 4000 }, { action: 'Rest', duration: 2000 }, { action: 'Down', duration: 4000 }]
                }],
                [{
                    title: 'Exercise B1',
                    buffer: 5000,
                    stages: [{ action: 'Up', duration: 4000 }, { action: 'Rest', duration: 2000 }, { action: 'Down', duration: 4000 }]
                }, {
                    title: 'Exercise B2',
                    buffer: 5000,
                    stages: [{ action: 'Up', duration: 4000 }, { action: 'Rest', duration: 2000 }, { action: 'Down', duration: 4000 }]
                }],
                [{
                    title: 'Exercise C1',
                    buffer: 5000,
                    stages: [{ action: 'Up', duration: 4000 }, { action: 'Rest', duration: 2000 }, { action: 'Down', duration: 4000 }]
                }, {
                    title: 'Exercise C2',
                    buffer: 5000,
                    stages: [{ action: 'Up', duration: 4000 }, { action: 'Rest', duration: 2000 }, { action: 'Down', duration: 4000 }]
                }, {
                    title: 'Exercise C3',
                    buffer: 5000,
                    stages: [{ action: 'Up', duration: 4000 }, { action: 'Rest', duration: 2000 }, { action: 'Down', duration: 4000 }]
                }]
            ]
        }];

    for (let i = 0; i < workoutPlans.length; i++) {
        const plan = workoutPlans[i]
        for (const slot of plan.exerciseSlots) {
            for (let i = 0; i < slot.length; i++) {
                const dbEcersise = await Exercise.findOne(slot[i]) || await new Exercise(slot[i]).save();
                slot[i] = dbEcersise
            }
        }
        workoutPlans[i] = await new WorkoutPlan(plan).save()
    }

    let workouts = [{
        user: users[0]._id,
        exercises: workoutPlans[0].exerciseSlots.map(slot => slot[0]),
        weights: [100, 110, 120],
        comments: ["it was hard", "ahhh", ""],
        plan: workoutPlans[0]._id,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10))
    }, {
        user: users[0]._id,
        exercises: [
            workoutPlans[0].exerciseSlots[0][0],
            workoutPlans[0].exerciseSlots[1][1],
            workoutPlans[0].exerciseSlots[2][1]
        ],
        weights: [105, 180, 190],
        comments: ['', 'Great Press', ''],
        plan: workoutPlans[0]._id,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5))
    }, {
        user: users[0]._id,
        exercises: workoutPlans[0].exerciseSlots.map(slot => slot[0]),
        weights: [110, 115, 125],
        comments: ['', '', ''],
        plan: workoutPlans[0]._id,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1))
    }, {
        user: users[0]._id,
        exercises: workoutPlans[1].exerciseSlots.map(slot => slot[0]),
        weights: [100],
        comments: [''],
        plan: workoutPlans[1]._id,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2))
    }, {
        user: users[1]._id,
        exercises: workoutPlans[2].exerciseSlots.map(slot => slot[0]),
        weights: [100, 100, 100],
        comments: ['', '', ''],
        plan: workoutPlans[2]._id,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10))
    }, {
        user: users[1]._id,
        exercises: [
            workoutPlans[2].exerciseSlots[0][0],
            workoutPlans[2].exerciseSlots[1][1],
            workoutPlans[2].exerciseSlots[2][1]
        ],
        weights: [105, 100, 100],
        comments: ['', '', ''],
        plan: workoutPlans[2]._id,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 8))
    }, {
        user: users[1]._id,
        exercises: [
            workoutPlans[2].exerciseSlots[0][0],
            workoutPlans[2].exerciseSlots[1][0],
            workoutPlans[2].exerciseSlots[2][2]
        ],
        weights: [110, 105, 100],
        comments: ['', '', ''],
        plan: workoutPlans[2]._id,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2))
    }, {
        user: users[1]._id,
        exercises: [
            workoutPlans[2].exerciseSlots[0][0],
            workoutPlans[2].exerciseSlots[1][1],
            workoutPlans[2].exerciseSlots[2][0]
        ],
        weights: [115, 105, 105],
        comments: ['', '', ''],
        plan: workoutPlans[2]._id,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1))
    }];
    workouts = await Workout.insertMany(workouts);

    let started = new Date(new Date().setDate(new Date().getDate() - 3));
    let challanges = [{
        author: users[0]._id,
        participants: [{
            user: users[0]._id,
            joined: started
        }, {
            user: users[1]._id,
            joined: started
        }, {
            user: users[2]._id,
            joined: new Date(new Date().setDate(new Date().getDate() - 1))
        }]
    }];
    challanges = await Challange.insertMany(challanges)

    return require('mongoose').disconnect();
})()
