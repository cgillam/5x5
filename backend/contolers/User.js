const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy


const User = require("../models/User")

passport.use("login", new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password'
}, async (userName, Password, done) => {
    try {
        // Find user by username or email
        const user = await User.findByUserName(userName) || await User.findByEmail(userName)
        // If it does not exist, return false
        if (!user) return done(null, false)
        // If it does exist and the password matches, return the user
        if (await user.passWordMatches(Password)) return done(null, user)
        // Otherwise, the user exists and the password does not match, return false
        return done(null, false)
    } catch (error) {
        // Return any errors
        return done(error, null)
    }
}))


// Seralize user to id
passport.serializeUser((user, done) => done(null, user._id))

// Deseralize user by ID
passport.deserializeUser((id, done) => User.findById(id).then(
    (user) => done(null, user),
    (err) => done(err)
))


// Handle login - using the passport middleware custom callback
exports.login = (req, res, next) => passport.authenticate('login', (err, user, _info) => {
    // Pass error on if exists
    if (err) return next(err)
    // Return 401 if no user
    if (!user) return res.status(401).send("log in failed")

    // Login to user
    req.login(user, (err) => {
        if (err) return next(err)
        // Return public user object via JSON
        res.json(user.toPublic())
    })
})(req, res, next);


// Log the user out and return 200
exports.logOut = (req, res) => {
    req.logOut()
    res.status(200).end()
}

// Attempt to sign user up
exports.signUp = async (req, res, next) => {
    const {
        userName, password, age, gender, conversion, email
    } = req.body

    // Return 409 if there is already a user with the same username
    const existingUser = await User.findByUserName(userName) || await User.findByEmail(email);
    if (existingUser) return res.status(409).send("user already exists");

    // Create the user and set the password
    const user = await new User({ userName, age, conversion, gender, email }).setPassWord(password);
    await user.save()

    // Log client in as newly created user
    req.login(user, (err) => {
        if (err) return next(err)
        res.json(user.toPublic())
    })
}

// Return the current user or 401
exports.current = (req, res) => {
    if (req.user) {
        return res.json(req.user.toPublic())
    }
    res.status(401).end()
}