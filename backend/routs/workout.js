const router = require("express-promise-router")()

const workout = require("../contolers/workout.js")
const { loggedIn } = require('./middlewares.js');


router.get("/next", workout.next)
router.post("/submit", loggedIn, workout.submit)
router.get("/history", loggedIn, workout.history)


module.exports = router
