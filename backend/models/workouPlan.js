const mongoose = require("mongoose")

module.exports = mongoose.model('WorkoutPlan', new mongoose.Schema({
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    exerciseSlots: {
        required: true,
        type: [[{
            type: mongoose.Types.ObjectId,
            ref: "Excersie"
        }]]
    },
    deleted: Boolean
}, {
    timestamps: { createdAt: true, updatedAt: false }
}));