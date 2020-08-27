const router = require("express-promise-router")()
const user = require("../contolers/User.js")



router.get("/current", user.current)
router.post("/login", user.login)
router.post("/signup", user.signUp)
router.get("/logout", user.logOut)

module.exports = router
