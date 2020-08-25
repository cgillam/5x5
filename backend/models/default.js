const WorkoutPlan = require("./workouPlan.js");
const Exercise = require('./Exercise')

const DefaultExersiserPlan = {
    exerciseSlots: [
        [
            {
                title: 'Squat',
                buffer: 3000,
                stages: [{ action: 'Squat', duration: 400 }, { action: 'Raise', duration: 200 }, { action: 'Reset', duration: 400 }],
            }
        ], [{
            title: 'Bench',
            buffer: 3000,
            stages: [{ action: 'Lower', duration: 400 }, { action: 'Pause', duration: 200 }, { action: 'Raise', duration: 400 }],
        }, {
            title: 'Press',
            buffer: 3000,
            stages: [{ action: 'Lower', duration: 400 }, { action: 'Pause', duration: 200 }, { action: 'Raise', duration: 400 }],
        }], [{
            title: 'Row',
            buffer: 3000,
            stages: [{ action: 'Raise', duration: 400 }, { action: 'Lower', duration: 200 }, { action: 'Reset', duration: 400 }],
        }, {
            title: 'Deadlift',
            buffer: 3000,
            stages: [{ action: 'Raise', duration: 400 }, { action: 'Lower', duration: 200 }, { action: 'Reset', duration: 400 }],
        }]
    ]
};

let defaultPlan;

module.exports = async () => {
    if (defaultPlan) return defaultPlan;

    for (const slot of DefaultExersiserPlan.exerciseSlots) {
        for (let i = 0; i < slot.length; i++) {
            const dbEcersise = await Exercise.findOne(slot[i]) || await new Exercise(slot[i]).save();
            slot[i] = dbEcersise
        }
    }

    const rawPlan = await WorkoutPlan.findOne(DefaultExersiserPlan) || await new WorkoutPlan(DefaultExersiserPlan).save();
    const plan = await rawPlan.populate({ path: 'exerciseSlots', model: "Exercise" }).execPopulate();
    defaultPlan = plan
    return plan
}