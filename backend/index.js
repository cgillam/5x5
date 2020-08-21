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
require("dotenv").config({ path: path.join(CONSTANCE.ROOT, ".env") })


const PORT = process.env.PORT || 5050
const SECRET = process.env.SECRET || 'abcdef'
const connectToDataBase = require("./models/index.js")
const rout = require("./routs/index.js")

const app = express()

app.use(morgan("common"))
app.use(express.static(CONSTANCE.FRONTEND_STATIC))

app.use(cookieParser(SECRET))
//app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(multer().none())
app.use(session({

    secret: SECRET,
    store: new FileStore({}),
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())


app.use(rout)

app.get("*", (req, res) => {
    res.sendFile(path.join(CONSTANCE.FRONTEND_STATIC, "index.html"))
})

app.listen(PORT, () => {
    console.log(`listening http://localhost:${PORT}`)
    connectToDataBase().then(
        () => console.log("database establishe"),
        (...errs) => console.error('database error', ...errs)
    )
})