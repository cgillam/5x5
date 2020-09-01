// Workout-plan related routes

const router = require("express-promise-router")()
const workoutPlan = require("../contolers/workoutPlan.js")
const { loggedIn } = require('./middlewares.js');


// List all workout plans
router.get("/list", workoutPlan.list)
// Create a new workout plan
router.post("/create", loggedIn, workoutPlan.create)

// Get the default workout plan
router.get("/", workoutPlan.default)
// Get a workout plan by ID
router.get("/:id", workoutPlan.getByID)
// Delete your own workout plan by ID
router.delete("/:id", loggedIn, workoutPlan.deleteByID)

module.exports = router
