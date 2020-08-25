const router = require("express-promise-router")();

const user = require("./user.js");
const workout = require("./workout.js");
const workoutPlan = require("./workoutPlan.js");

router.use("/api/user", user);
router.use("/api/workout", workout);
router.use("/api/plans", workoutPlan);

module.exports = router
