const express = require('express')
const morgan = require('morgan')

const path = require('path')
const CONSTANCE = require('./constance.js')
require("dotenv").config({ path: path.join(CONSTANCE.ROOT, ".env") })


const PORT = process.env.PORT || 5050
const connectToDataBase = require("./models/index.js")
const rout = require("./routs/index.js")

const app = express()

app.use(morgan("common"))
app.use(express.static(CONSTANCE.FRONTEND_STATIC))



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