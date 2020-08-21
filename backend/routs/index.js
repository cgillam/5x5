const router = require("express-promise-router")();

const user = require("./user.js");
const workout = require("./workout.js");

router.use("/api/user", user);
router.use("/api/workout", workout);

module.exports = router
