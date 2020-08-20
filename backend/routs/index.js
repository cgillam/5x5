const router = require("express-promise-router")()

const user = require("./user.js")

router.use("/api/user", user);

module.exports = router
