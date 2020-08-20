const User = require("../models/User")

exports.logOut = (req, res) => {
    req.logOut()
    res.status(200).end()
}
exports.signUp = async (req, res, next) => {
    const {
        userName, Password
    } = req.body

    const existingUser = await User.findByUserName(userName)
    if (existingUser) return res.status(409).send("userName already exists");

    const user = await new User({ userName }).setPassword(Password);
    await user.save()
    res.login(user, (err) => {
        if (err) return next(err)
        res.json(user.toPublic())
    })
}
exports.current = (req, res) => {
    if (req.user) {
        return res.json(req.user.toPublic())
    }
    res.status(401).end()
}
exports.login = (req, res) => {

}