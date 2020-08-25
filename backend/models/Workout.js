const mongoose = require("mongoose")

// todo - add validate middleware to ensure exercises.length === weights
module.exports = mongoose.model('Workout', new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },

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