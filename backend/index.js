// Express server entry point

const express = require('express')
const passport = require("passport")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const session = require("express-session")
const multer = require("multer")
const FileStore = require("session-file-store")(session)
const morgan = require('morgan')

const path = require('path')
const CONSTANCE = require('./constance.js')
// load enviroment variables from ../.env
require("dotenv").config({ path: path.join(CONSTANCE.ROOT, ".env") })

// Get port or default as 5050
const PORT = process.env.PORT || 5050
// Get secret or default as abcdef
const SECRET = process.env.SECRET || 'abcdef'
const connectToDataBase = require("./models/index.js")
const rout = require("./routs/index.js")

const app = express()

// Use common logging
app.use(morgan("common"))
// Serve static files from react
app.use(express.static(CONSTANCE.FRONTEND_STATIC))

// Parse cookies
app.use(cookieParser(SECRET))
// Parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }))
// Parse JSON - with increased limit for base64 image data
app.use(bodyParser.json({ limit: '100mb' }))
// Parse formdata
app.use(multer().none())
// Allow sessions
app.use(session({
    secret: SECRET,
    store: new FileStore({}),
    resave: false,
    saveUninitialized: false
}))

// Add passport
app.use(passport.initialize())
app.use(passport.session())


// Add declared routes
app.use(rout)

// Redirect all remaining requests to react index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(CONSTANCE.FRONTEND_STATIC, "index.html"))
})

// Listen to server and connect to database
app.listen(PORT, () => {
    console.log(`listening http://localhost:${PORT}`)
    connectToDataBase().then(
        () => console.log("Database connection established"),
        (...errs) => console.error('Database connection error:', ...errs)
    )
})