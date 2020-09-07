const Workout = require("../models/Workout")
const Exercise = require("../models/Exercise")
const WorkoutPlan = require("../models/workouPlan")
const { getDefault: getDefaultWorkouPlan } = require("../models/default")


// Get the default workout plan
exports.default = async (req, res) => {
    const plan = await getDefaultWorkouPlan()
    res.json({ plan })
}

// Get a workout by ID
exports.getByID = async (req, res) => {
    const { id } = req.params
    const plan = await WorkoutPlan.findById(id).populate({ path: 'exerciseSlots', model: "Exercise" });
    // Return 404 if workout not found
    if (!plan) return res.status(404).end()
    res.json({ plan })

}



// Get all the plans
exports.list = async (req, res) => {
    const plans = await WorkoutPlan
        // Don't show deleted plans
        .find({
            deleted: { $exists: false }, $or: [
                { author: req.user._id },
                { author: { $exists: false } }
            ]
        })
        .populate({ path: 'exerciseSlots', model: "Exercise" })
        // Populate the userName of all authors
        .populate('author', 'userName');

    // TODO - filter out default old plan

    res.json({
        plans: plans.map((plan) => {
            const objPlan = plan.toJSON();
            // Delete all the exercise images to save bandwidth
            objPlan.exerciseSlots.forEach(slot => slot.forEach(exercise => {
                delete exercise.image;
            }));
            return objPlan;
        })
    })
}

exports.listPublic = async (req, res) => {
    const plans = await WorkoutPlan
        // Don't show deleted plans
        .find({
            deleted: { $exists: false },
            $and: [
                { author: { $ne: req.user._id } },
                { author: { $exists: true } }
            ]
        })
        .populate({ path: 'exerciseSlots', model: "Exercise" })
        // Populate the userName of all authors
        .populate('author', 'userName');

    res.json({
        plans: plans.map((plan) => {
            const objPlan = plan.toJSON();
            // Delete all the exercise images to save bandwidth
            objPlan.exerciseSlots.forEach(slot => slot.forEach(exercise => {
                delete exercise.image;
            }));
            return objPlan;
        })
    })
}

// Delete a workout by ID
exports.deleteByID = async (req, res) => {
    const { id } = req.params
    const plan = await WorkoutPlan.findById(id)
    // If not found, return 404
    if (!plan) return res.status(404).end()
    // If found, and there is no author or the author does not equal the current user, return 403 and disabllow
    if (!plan.author || !plan.author.equals(req.user._id)) return res.status(403).end()

    // Soft-delete plan
    plan.deleted = true
    await plan.save()

    res.status(200).end()
}

// Create a new workout plan
exports.create = async (req, res) => {
    const { exerciseSlots } = req.body

    // Find/create all the exercises in all of the exercise slots
    for (const slot of exerciseSlots) {
        for (let i = 0; i < slot.length; i++) {
            // Remove current ID, to allow for creation if needed
            delete slot[i]._id;
            const dbEcersise = await Exercise.findOne(slot[i]) || await new Exercise(slot[i]).save();
            slot[i] = dbEcersise
        }
    }

    // Create the new plan
    let rawPlan = await new WorkoutPlan({ author: req.user._id, exerciseSlots }).save();
    rawPlan = await rawPlan.populate({ path: 'exerciseSlots', model: "Exercise" }).execPopulate();
    res.json({ plan: rawPlan })
}