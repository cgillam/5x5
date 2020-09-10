const mongoose = require("mongoose")

module.exports = mongoose.model('Workout', new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: String,
    exercises: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: 'Exercise'
        }],
        required: true

    },
    weights: {
        type: [Number],
        required: true,
    },
    comments: {
        type: [String],
        required: true,
    },
    plan: {
        type: mongoose.Types.ObjectId,
        ref: 'WorkoutPlan',
        required: true
    },
}, {
    timestamps: { createdAt: true, updatedAt: false }
}));