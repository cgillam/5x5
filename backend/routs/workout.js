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
// Get the weight of the latest squat
router.get("/next-squat-weight", loggedIn, workout.nextSquatWeight)


module.exports = router