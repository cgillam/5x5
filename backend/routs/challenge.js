
const router = require("express-promise-router")()

const challenge = require("../contolers/Challenge.js")

router.get('/statuses', challenge.statuses)
router.post("/", challenge.create);
router.get("/participating", challenge.participating);
router.get("/requests", challenge.requests);
router.get("/completed", challenge.completed);
router.post("/requests/accept", challenge.acceptRequest);
//router.post("/requests/send", challenge.sendRequest);
router.post("/videos/submit", challenge.submitVideo);
router.get("/videos/get", challenge.getVideos);
router.post("/quit", challenge.quit);

module.exports = router
