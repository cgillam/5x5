const passport = require("passport")
const { Strategy: LocalStrategy } = require("passport-local")


const User = require("../models/User")

passport.use("log-in", new LocalStrategy(async (userName, Password, done) => {
    try {

        const user = await User.findByUserName(userName)
        if (!user) return done(null, false)
        if (await user.PaswordMatches(Password)) return done(null, user)
        return done(null, false)

    } catch (error) {
        return done(err)

    }


}))


passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser((id, done) => User.findById(id).then(
    (user) => done(null, user),
    (err) => done(err)
))


exports.login = (req, res, next) => passport.authenticate('log-in', (err, user, _info) => {
    if (err) return next(err)
    if (!user) return res.status(401).send("log in failed")

    res.login(user, (err) => {
        if (err) return next(err)
        res.json(user.toPublic())
    })
})


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