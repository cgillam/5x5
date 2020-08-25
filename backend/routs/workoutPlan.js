const router = require("express-promise-router")()
const workoutPlan = require("../contolers/workoutPlan.js")


router.get("/list", workoutPlan.list)
router.post("/create", workoutPlan.create)
router.get("/", workoutPlan.default)
router.get("/:id", workoutPlan.getByID)
router.delete("/:id", workoutPlan.deleteByID)

module.exports = router
