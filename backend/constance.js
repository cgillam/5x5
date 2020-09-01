// Constant values to be used throughout the server

const path = require("path")

const ROOT = path.join(__dirname, "..")
const FRONTEND = path.join(ROOT, "5x5_frontend")
const FRONTEND_STATIC = path.join(FRONTEND, "build")

module.exports = { ROOT, FRONTEND, FRONTEND_STATIC }