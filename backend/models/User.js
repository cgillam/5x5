const bcrypt = require("bcrypt")
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        minlength: 2,
        unique: true,
    },
    passWord: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true,
    },
    conversion: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    }
})

// Find a user by username - case insensitive
userSchema.statics.findByUserName = function (userName) {
    return this.findOne({ userName: { $regex: userName, $options: "i" } })
}

// Find a user by username - case insensitive
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: { $regex: email, $options: "i" } })
}

// Set the password of the current user - chainable
userSchema.methods.setPassWord = async function (passWord) {
    this.passWord = await bcrypt.hash(passWord, 1024)
    return this
}

// Return if the password given matches the users current password
userSchema.methods.passWordMatches = function (passWord) {
    return bcrypt.compare(passWord, this.passWord)
}

// Strip sensitive data from the user object and return it
userSchema.methods.toPublic = function () {
    const { passWord, ...user } = this.toJSON()

    return user
}


module.exports = mongoose.model('User', userSchema);
