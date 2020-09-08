// User and authentication related routes

const router = require("express-promise-router")()

const user = require("../contolers/User.js")

// Get the current user
router.get("/current", user.current)
// Login as a user
router.post("/login", user.login)
// Signup as a user
router.post("/signup", user.signUp)
// Logout from a user
router.get("/logout", user.logOut)
router.get("/verify", user.verify)

router.post("/search", user.search)

router.get("/:userName", user.get)

module.exports = router
