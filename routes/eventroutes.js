const { application } = require("express");
const { findAllEvents, findEvent, isRegisteredforEvent } = require("../utils.js");

const router = require("express").Router();

router.get("/", async (req, res) => {
    let events = await findAllEvents();
    res.render("events.ejs", { events });
})

router.get("/game", async (req, res) => {
    const gameName = req.query.game;
    const event = await findEvent(gameName);
    if (event == null)
        res.send("No such game found");

    // const checker = isRegisteredforEvent(req.user, event);
    // console.log(checker);

    const context = {
        event: event,
        // isRegisteredforEvent: checker ? checker.toString() : "false",
        authenticated: req.isAuthenticated(),
    };

    res.render("game", { ...context, user: req.session.user });

})


router.get("/createTeam", async (req, res) => {
    const gameName = req.query.game;
    const event = await findEvent(gameName);

    const context = {
        event: event,
        user: req.session.user
    }

    res.render('createteam.ejs', context)
})

router.post("/createTeam", async (req, res) => {
    const gameName = req.query.game;
    const event = await findEvent(gameName);

    const {
        TeamName
    } = req.body;

    console.log(TeamName);


    res.redirect("/");
})

module.exports = router;