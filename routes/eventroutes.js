const router = require("express").Router();

router.get("/", async (req, res) => {
    res.render("events.ejs");
})

router.get("/game", async (req, res) => {
    res.render("game.ejs")
})

router.get("/game/confirm", async (req, res) => {
    res.render("confirm.ejs")
})

module.exports = router;