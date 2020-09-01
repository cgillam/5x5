const mongoose = require("mongoose")

module.exports = mongoose.model('Exercise', new mongoose.Schema({
    image: String,
    title: {
        type: String,
        required: true,
        minlength: 2
    },
    buffer: {
        type: Number,
        min: 0,
        max: 60000,
        required: true
    },
    stages: {
        type: [{
            _id: false,
            action: {
                type: String,
                required: true,
                minlength: 2
            },
            duration: {
                type: Number,
                min: 0,
                max: 600000
            }
        }],
        require: true,
        validate: [stages => stages.length, 'must have at least one stage']
    }
}));