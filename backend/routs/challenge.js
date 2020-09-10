
const router = require("express-promise-router")()

const challenge = require("../contolers/Challenge.js")
const { loggedIn } = require('./middlewares.js');

// Get statuses of all linked challenges
router.get('/statuses', loggedIn, challenge.statuses)
// Create challenge
router.post("/", loggedIn, challenge.create);
// Get all participating challenges
router.get("/participating", loggedIn, challenge.participating);
// Get all challenge requests
router.get("/requests", loggedIn, challenge.requests);
// Get all completed chllanges
router.get("/completed", loggedIn, challenge.completed);
// Accept challenge request
router.post("/requests/accept", loggedIn, challenge.acceptRequest);
// Submit video to challenge
router.post("/videos/submit", loggedIn, challenge.submitVideo);
// Get videos from challenge
router.get("/videos/get", loggedIn, challenge.getVideos);
// Quit a challenge
router.post("/quit", loggedIn, challenge.quit);

module.exports = router
