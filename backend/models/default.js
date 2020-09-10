// Default data required to be seeded to the database

const fs = require('fs');
const path = require('path');

const WorkoutPlan = require("./workouPlan.js");
const Exercise = require('./Exercise');

// Initial exercise plan
const DefaultExersiserPlan = {
    exerciseSlots: [
        [{
            title: 'Squat',
            image: 'data:image/gif;base64, ' + fs.readFileSync(path.join(__dirname, '../assets/barbell-squat.gif')).toString('base64'),
            buffer: 20000,
            stages: [{ action: 'Squat', duration: 4000 }, { action: 'Raise', duration: 2000 }, { action: 'Reset', duration: 4000 }],
        }], [{
            title: 'Bench',
            image: 'data:image/gif;base64, ' + fs.readFileSync(path.join(__dirname, '../assets/bench.gif')).toString('base64'),
            buffer: 20000,
            stages: [{ action: 'Lower', duration: 4000 }, { action: 'Pause', duration: 2000 }, { action: 'Raise', duration: 4000 }],
        }, {
            title: 'Press',
            image: 'data:image/gif;base64, ' + fs.readFileSync(path.join(__dirname, '../assets/military-press.gif')).toString('base64'),
            buffer: 20000,
            stages: [{ action: 'Lower', duration: 4000 }, { action: 'Pause', duration: 2000 }, { action: 'Raise', duration: 4000 }],
        }], [{
            title: 'Row',
            image: 'data:image/gif;base64, ' + fs.readFileSync(path.join(__dirname, '../assets/row.gif')).toString('base64'),
            buffer: 20000,
            stages: [{ action: 'Raise', duration: 4000 }, { action: 'Lower', duration: 2000 }, { action: 'Reset', duration: 4000 }],
        }, {
            title: 'Deadlift',
            image: 'data:image/gif;base64, ' + fs.readFileSync(path.join(__dirname, '../assets/conventional-deadlifts-2-4.gif')).toString('base64'),
            buffer: 20000,
            stages: [{ action: 'Raise', duration: 4000 }, { action: 'Lower', duration: 200 }, { action: 'Reset', duration: 4000 }],
        }]
    ]
};
exports.defaultPlan = DefaultExersiserPlan

// In-memory cache of default plan
let defaultPlan;

// Return the cached memory plan, or create/find all exercises, then create/find the workout plan,
// then caches the plan
exports.getDefault = async () => {
    if (defaultPlan) return defaultPlan;

    for (const slot of DefaultExersiserPlan.exerciseSlots) {
        for (let i = 0; i < slot.length; i++) {
            const dbEcersise = await Exercise.findOne(slot[i]) || await new Exercise(slot[i]).save();
            slot[i] = dbEcersise
        }
    }

    // Find or create the plan
    const rawPlan = await WorkoutPlan.findOne(DefaultExersiserPlan) || await new WorkoutPlan(DefaultExersiserPlan).save();
    // Populate the exercise slots of the plan
    const plan = await rawPlan.populate({ path: 'exerciseSlots', model: "Exercise" }).execPopulate();
    defaultPlan = plan
    return plan
}