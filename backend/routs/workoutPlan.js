const router = require("express-promise-router")()
const workoutPlan = require("../contolers/workoutPlan.js")
const { loggedIn } = require('./middlewares.js');


router.get("/list", workoutPlan.list)
router.post("/create", loggedIn, workoutPlan.create)

router.get("/", workoutPlan.default)
router.get("/:id", workoutPlan.getByID)
router.delete("/:id", loggedIn, workoutPlan.deleteByID)

module.exports = router
