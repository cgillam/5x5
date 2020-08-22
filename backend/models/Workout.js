const mongoose = require("mongoose")

// todo - add validate middleware to ensure exercises.length === weights
module.exports = mongoose.model('Workout', new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exercises: {
        /*
        type: [{
            type: mongoose.Types.ObjectId,
            ref: 'Exercise'
        }],*/
        type: [{
            type: String,
        }],
        required: true,
        /*validate: [exercises => {
            console.log(exercises);
            return exercises.length
        }, 'must have at least one exercise']*/

    },
    weights: {
        type: [Number],
        required: true,
    },
    comments: {
        type: [String],
        required: true,
    },

}, {
    timestamps: { createdAt: true, updatedAt: false }
}));