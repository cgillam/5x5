const router = require("express-promise-router")()


router.get("/current", (req, res) => {

    res.json({
        id: 0
    })
})

module.exports = router