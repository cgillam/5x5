const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy


const User = require("../models/User")

passport.use("login", new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password'
}, async (userName, Password, done) => {
    try {
        const user = await User.findByUserName(userName)
        if (!user) return done(null, false)
        if (await user.passWordMatches(Password)) return done(null, user)
        return done(null, false)

    } catch (error) {
        return done(error, null)

    }


}))


passport.serializeUser((user, done) => console.log(user) || done(null, user.id))

passport.deserializeUser((id, done) => console.log(id) || User.findById(id).then(
    (user) => done(null, user),
    (err) => done(err)
))


exports.login = (req, res, next) => passport.authenticate('login', (err, user, _info) => {
    if (err) return next(err)
    if (!user) return res.status(401).send("log in failed")

    req.login(user, (err) => {
        if (err) return next(err)
        res.json(user.toPublic())
    })
})(req, res, next);


exports.logOut = (req, res) => {
    req.logOut()
    res.status(200).end()
}
exports.signUp = async (req, res, next) => {
    const {
        userName, password
    } = req.body

    const existingUser = await User.findByUserName(userName)
    if (existingUser) return res.status(409).send("userName already exists");

    const user = await new User({ userName }).setPassWord(password);
    await user.save()
    req.login(user, (err) => {
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