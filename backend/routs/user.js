// User and authentication related routes

const router = require("express-promise-router")()

const user = require("../contolers/User.js")
const { loggedIn } = require('./middlewares.js');

// Get the current user
router.get("/current", user.current)
// Login as a user
router.post("/login", user.login)
// Signup as a user
router.post("/signup", user.signUp)
// Update your user
router.post("/update", loggedIn, user.update)
// Logout from a user
router.get("/logout", user.logOut)
// Verify a user
router.get("/verify", user.verify)
// Search for a user
router.post("/search", loggedIn, user.search)
// Get the details of a certain user
router.get("/:userName", loggedIn, user.get)

module.exports = router
