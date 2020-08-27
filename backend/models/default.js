const WorkoutPlan = require("./workouPlan.js");
const Exercise = require('./Exercise')

// heroku scale web=0

const DefaultExersiserPlan = {
    exerciseSlots: [
        [
            {
                title: 'Squat',
                buffer: 30000,
                stages: [{ action: 'Squat', duration: 4000 }, { action: 'Raise', duration: 2000 }, { action: 'Reset', duration: 4000 }],
            }
        ], [{
            title: 'Bench',
            buffer: 30000,
            stages: [{ action: 'Lower', duration: 4000 }, { action: 'Pause', duration: 2000 }, { action: 'Raise', duration: 4000 }],
        }, {
            title: 'Press',
            buffer: 30000,
            stages: [{ action: 'Lower', duration: 4000 }, { action: 'Pause', duration: 2000 }, { action: 'Raise', duration: 4000 }],
        }], [{
            title: 'Row',
            buffer: 30000,
            stages: [{ action: 'Raise', duration: 4000 }, { action: 'Lower', duration: 2000 }, { action: 'Reset', duration: 4000 }],
        }, {
            title: 'Deadlift',
            buffer: 30000,
            stages: [{ action: 'Raise', duration: 4000 }, { action: 'Lower', duration: 200 }, { action: 'Reset', duration: 4000 }],
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