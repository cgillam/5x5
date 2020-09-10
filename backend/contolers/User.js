const fs = require("fs")

const nodemailer = require("nodemailer")
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy

const { ENV } = require("../constance")

const User = require("../models/User")
const Workout = require("../models/Workout")

// Get options for nodemailer
const getMailOptions = async () => {
    // If already defined in enviroment, parse and return those
    if (process.env.NODEMAILER_TRANSPORT) return JSON.parse(process.env.NODEMAILER_TRANSPORT)

    // Otherwise, create and write test credentials to .env file
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

// Get mail transport with provided options
const getMailTransport = options => nodemailer.createTransport(options);
exports.getMailTransport = getMailTransport

// Generate random string of length - not original
const randomString = length => Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);

// Generate numbers in range of min and max - both inclusive
const numbersInRange = (min, max) => [...Array(max - min + 1).keys()].map(i => i + min);

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
        userName, password, age, gender, conversion, email, referalCode, visibility, profileImage
    } = req.body

    // Return 409 if there is already a user with the same username
    const existingUser = await User.findByUserName(userName) || await User.findByEmail(email);
    if (existingUser) return res.status(409).send("user already exists");

    // Find user whose referal code matches
    const referdBy = await User.findOne({ referalCode });

    // Create the user and set the password
    const user = await new User({
        userName, age, conversion, gender, email,
        verification: {
            code: randomString(10),
            // If the user has been refered, mark them as verified - but with -1
            // to distinguish them from those who have had to self-verify
            verified: referdBy
                ? -1
                : false
        },
        referalCode: randomString(5),
        visibility,
        profileImage
    }).setPassWord(password);
    await user.save()

    // If refered, log the user in
    if (referdBy) return req.login(user, (err) => {
        if (err) return next(err)
        res.json(user.toSelf())
    });


    // Otherwise, send the user an email using these credentials
    const hostName = process.env.EMAIL_HOSTNAME || 'localhost:3000';
    const senderName = process.env.EMAIL_SENDER_NAME || 'Name';
    const senderEmail = process.env.EMAIL_SENDER_EMAIL || 'example@example.com'
    const url = `http://${hostName}/verify?code=${user.verification.code}`;
    const transport = getMailTransport(await getMailOptions());
    const mail = await transport.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: "Account Verify",
        text: `Click link to verify your account ${url}`,
        html: `<a href="${url}">Click to Verify</a>`
    });

    // If using test credentials, modify message with message URL and console.log the message URL
    let message = "verification email sent"
    if (transport.options.host && transport.options.host.includes('ethereal.email')) {
        message = "view verification email: " + nodemailer.getTestMessageUrl(mail);
        console.log(message);
    }

    res.status(200).send(message);
}

// Allow the user to update parts of their profile
exports.update = async (req, res, next) => {
    const {
        age, gender, conversion, visibility
    } = req.body

    const user = req.user;
    // For each field, update it if it's been included
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (conversion) user.conversion = conversion;
    if (visibility) user.visibility = visibility;

    await user.save();

    res.json(user.toSelf())
}


// Verify the user by code
exports.verify = async (req, res, next) => {
    const { code } = req.query;

    // Find the user with the provied code
    const user = await User.findOne({
        'verification.code': code,
    });
    if (!user) return res.status(404).send("user not found");

    // Verify the user right now
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

// Search for user by query and query type
exports.search = async (req, res) => {
    const { query, queryType } = req.body;

    // Find public users by identifier, or age
    const users = await User.find({
        visibility: 'public',
        ...{
            // For identifier, simply check if the username or email contains the query ignoring case
            identifier: query => ({
                $or: [
                    { userName: { $regex: query, $options: "i" } },
                    { email: { $regex: query, $options: "i" } }
                ]
            }),
            // For the age, check that the age is within a range of age-5 to age+5
            age: query => {
                const age = Number(query);
                return {
                    $and: [
                        { age: { $gte: age - 5 } },
                        { age: { $lte: age + 5 } }
                    ]
                }
            },
            // Weight cannot be filtered with a single query, so use a noop
            weight: () => ({})
        }[queryType](query)
    });

    // Perform manual filtering for weight
    if (queryType === 'weight') {
        const weight = Number(query);
        for (const user of [...users]) {
            // Get all workouts of user - and those exercises
            const workouts = await Workout.find({
                user
            }).populate('exercises');
            // Convert array of array of exercises, into an array of just squats, with the weight the squat was performed at
            const weightedExercises = workouts.map(w => w.exercises.map(({ title }, i) => ({
                title,
                weight: w.weights[i]
            }))).flat().filter(e => e.title === 'Squat');
            // Check if any of the squats have a weight within the weight-25 to weight+25 range
            const found = weightedExercises.some(squat => {
                if (squat.weight < weight - 25) return false;
                if (squat.weight > weight + 25) return false;
                return true;
            })
            if (found) continue;
            // If not, remove the user
            const userIndex = users.findIndex(loopUser => loopUser._id.equals(user._id));
            users.splice(userIndex, 1);
        }
    }

    res.json(users.map(user => user.toPublic()));
}

// Get a user exacty by username
exports.get = async (req, res) => {
    const { userName } = req.params
    const user = await User.findByUserName(userName);
    // we add the != public check to ensure private users cannot be directly found
    if (!user || (user.visibility !== 'public' && !req.user._id.equals(user._id))) return res.status(404).json({ message: "user not found" });

    // If it's the current user, return self, otherwise public variant
    res.json({
        user: user._id.equals(req.user._id)
            ? user.toSelf()
            : user.toPublic()
    })
}