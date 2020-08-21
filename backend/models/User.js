const bcrypt = require("bcrypt")
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        minlength: 3,
        unique: true,
    },
    passWord: {
        type: String,
        required: true,
    }
})

userSchema.statics.findByUserName = function (userName) {
    return this.findOne({ userName: { $regex: userName, $options: "i" } })
}


userSchema.methods.setPassWord = async function (passWord) {
    this.passWord = await bcrypt.hash(passWord, 1024)
    return this
}

userSchema.methods.passWordMatches = function (passWord) {
    return bcrypt.compare(passWord, this.passWord)
}
userSchema.methods.toPublic = function () {
    const { passWord, ...user } = this.toJSON()

    return user
}


module.exports = mongoose.model('User', userSchema);
