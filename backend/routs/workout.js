// Workout related routes

const router = require("express-promise-router")()

const workout = require("../contolers/Workout.js")
const { loggedIn } = require('./middlewares.js');

// Get the next workout
router.get("/next", workout.next)
// Submit a completed workout for the user
router.post("/submit", loggedIn, workout.submit)
// Get all the previous workouts for the current user
router.get("/history", loggedIn, workout.history)


module.exports = router