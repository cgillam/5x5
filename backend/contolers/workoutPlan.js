const Workout = require("../models/Workout")
const Exercise = require("../models/Exercise")
const WorkoutPlan = require("../models/workouPlan")
const getDefaultWorkouPlan = require("../models/default")



exports.default = async (req, res) => {
    const plan = await getDefaultWorkouPlan()
    res.json({ plan })
}

exports.getByID = async (req, res) => {
    const { id } = req.params
    const plan = await (await WorkoutPlan.findById(id)).populate({ path: 'exerciseSlots', model: "Exercise" });
    if (!plan) return res.status(404).end()
    res.json({ plan })

}



exports.list = async (req, res) => {
    const plans = await WorkoutPlan.find({ deleted: { $exists: false } }).populate({ path: 'exerciseSlots', model: "Exercise" });
    res.json({ plans: plans.map((plan) => plan.toJSON()) })
}

exports.deleteByID = async (req, res) => {

    const { id } = req.params
    const plan = await WorkoutPlan.findById(id)
    console.log(plan);
    if (!plan) return res.status(404).end()
    if (!plan.author || !plan.author.equals(req.user._id)) return res.status(403).end()
    plan.deleted = true
    await plan.save()
    res.status(200).end()
}

exports.create = async (req, res) => {
    const { exerciseSlots } = req.body

    for (const slot of exerciseSlots) {
        for (let i = 0; i < slot.length; i++) {
            delete slot[i]._id;
            const dbEcersise = await Exercise.findOne(slot[i]) || await new Exercise(slot[i]).save();
            slot[i] = dbEcersise
        }
    }

    let rawPlan = await new WorkoutPlan({ author: req.user._id, exerciseSlots }).save();
    rawPlan = await rawPlan.populate({ path: 'exerciseSlots', model: "Exercise" }).execPopulate();
    res.json({ plan: rawPlan })
}