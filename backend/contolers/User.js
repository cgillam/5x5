const fs = require("fs")

const nodemailer = require("nodemailer")
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy

const { ENV } = require("../constance")

const User = require("../models/User")
const Workout = require("../models/Workout")

const getMailOptions = async () => {
    if (process.env.NODEMAILER_TRANSPORT) return JSON.parse(process.env.NODEMAILER_TRANSPORT)
    console.warn("NODEMAILER_TRANSPORT not found")
    const test = await nodemailer.createTestAccount()

    const options = {
        host: test.smtp.host,
        port: test.smtp.port,
        secure: test.smtp.secure,
        auth: {
            user: test.user,
            pass: test.pass
        }
    };

    await fs.promises.appendFile(ENV,
        `\nNODEMAILER_TRANSPORT=${JSON.stringify(options)}`
    )

    return options
}
exports.getMailOptions = getMailOptions

const getMailTransport = options => nodemailer.createTransport(options);
exports.getMailTransport = getMailTransport

const randomString = length => Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);

passport.use("login", new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password'
}, async (userName, Password, done) => {
    try {
        // Find user by username or email
        const user = await User.findByUserName(userName) || await User.findByEmail(userName)
        // If it does not exist, return false
        if (!user) return done(null, false, { message: 'User not found' })

        // If it does exist and the password matches, return the user
        if (await user.passWordMatches(Password)) {
            if (!user.verification.verified) return done(null, false, { message: "please verify your account" })
            return done(null, user)
        }
        // Otherwise, the user exists and the password does not match, return false
        return done(null, false, { message: "User not found" })
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
exports.login = (req, res, next) => passport.authenticate('login', (err, user, info) => {
    // Pass error on if exists
    if (err) return next(err)
    // Return 401 if no user
    if (!user) return res.status(401).send(info.message || "log in failed")

    // Login to user
    req.login(user, (err) => {
        if (err) return next(err)
        // Return public user object via JSON
        res.json(user.toSelf())
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
        userName, password, age, gender, conversion, email, referalCode, visibility
    } = req.body

    // Return 409 if there is already a user with the same username
    const existingUser = await User.findByUserName(userName) || await User.findByEmail(email);
    if (existingUser) return res.status(409).send("user already exists");

    const referdBy = await User.findOne({ referalCode });

    // Create the user and set the password
    const user = await new User({
        userName, age, conversion, gender, email,
        verification: {
            code: randomString(10),
            verified: referdBy
                ? -1
                : false
        },
        referalCode: randomString(5),
        visibility
    }).setPassWord(password);
    await user.save()

    if (referdBy) return req.login(user, (err) => {
        if (err) return next(err)
        res.json(user.toSelf())
    });


    const hostName = process.env.EMAIL_HOSTNAME || 'localhost:3000';
    const senderName = process.env.EMAIL_SENDER_NAME || 'Name';
    const senderEmail = process.env.EMAIL_SENDER_EMAIL || 'example@example.com'
    const url = `http://${hostName}/verify?code=${user.verification.code}`;
    const transport = getMailTransport(await getMailOptions());
    const mail = await transport.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: "Account Verify",
        text: `ClIdentifierick link to verify your account ${url}`,
        html: `<a href="${url}">Click to Verify</a>`
    });
    let message = "verification email sent"
    if (transport.options.host && transport.options.host.includes('ethereal.email')) {
        message = "view verification email: " + nodemailer.getTestMessageUrl(mail);
        console.log(message);
    }

    res.status(200).send(message);
}

// Attempt to sign user up
exports.update = async (req, res, next) => {
    const {
        age, gender, conversion, visibility
    } = req.body

    const user = req.user;
    console.log(user);
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (conversion) user.conversion = conversion;
    if (visibility) user.visibility = visibility;
    console.log(user);
    await user.save();

    res.json(user.toSelf())
}
exports.verify = async (req, res, next) => {
    const { code } = req.query;

    const user = await User.findOne({
        'verification.code': code,
    });
    if (!user) return res.status(404).send("user not found");

    if (!user.verification.verified) {
        user.verification = {
            ...user.verification,
            verified: Date.now()
        };
        await user.save()
    };

    req.login(user, (err) => {
        if (err) return next(err)
        res.json(user.toSelf())
    })
}

// Return the current user or 401
exports.current = (req, res) => {
    if (req.user) {
        return res.json(req.user.toSelf())
    }
    res.status(401).end()
}

const numbersInRange = (min, max) => [...Array(max - min + 1).keys()].map(i => i + min);

exports.search = async (req, res) => {
    const { query, queryType } = req.body;

    const users = await User.find({
        visibility: 'public',
        ...{
            identifier: query => ({
                $or: [
                    { userName: { $regex: query, $options: "i" } },
                    { email: { $regex: query, $options: "i" } }
                ]
            }),
            age: query => {
                const age = Number(query);
                return {
                    $and: [
                        { age: { $gte: age - 5 } },
                        { age: { $lte: age + 5 } }
                    ]
                }
            },
            weight: () => ({})
        }[queryType](query)
    });

    if (queryType === 'weight') {
        const weight = Number(query);
        for (const user of [...users]) {
            const workouts = await Workout.find({
                user
            }).populate('exercises');
            const weightedExercises = workouts.map(w => w.exercises.map(({ title }, i) => ({
                title,
                weight: w.weights[i]
            }))).flat().filter(e => e.title === 'Squat');
            const found = weightedExercises.some(squat => {
                if (squat.weight < weight - 25) return false;
                if (squat.weight > weight + 25) return false;
                return true;
            })
            if (found) continue;
            const userIndex = users.findIndex(loopUser => loopUser._id.equals(user._id));
            users.splice(userIndex, 1);
        }
    }

    res.json(users.map(user => user.toPublic()));
}

exports.get = async (req, res) => {
    const { userName } = req.params
    const user = await User.findByUserName(userName);
    // we add the != public check to ensure private users cannot be directly found
    if (!user || user.visibility !== 'public') return res.status(404).json({ message: "user not found" });

    res.json({
        user: user._id.equals(req.user._id)
            ? user.toSelf()
            : user.toPublic()
    })
}