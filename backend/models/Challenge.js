const mongoose = require("mongoose")

module.exports = mongoose.model('Challenge', new mongoose.Schema({
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requests: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: 'User',
        }],
        required: true
    },
    participants: {
        type: [{
            _id: false,
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
            joined: Date
        }],
        required: true
    },
    lost: {
        type: [{
            _id: false,
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
            joined: Date,
            lost: Date
        }],
        required: true
    },
    videos: {
        type: [{
            _id: false,
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
            video: {
                type: String,
                select: false
            },
            createdAt: Date
        }]
    },
    ended: Date,
    ending: Date
}, {
    timestamps: { createdAt: true, updatedAt: false }
}));