const { application } = require("express");
const { findAllEvents, findEvent, isRegisteredforEvent, createTeam } = require("../utils.js");

const router = require("express").Router();

router.get("/", async (req, res) => {
    let events = await findAllEvents();

    let context = {
        events: events,
        authenticated: req.isAuthenticated()
    }

    res.render("events.ejs", context);
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

    // validation need to  be added here
    let val = await createTeam(req, event);
    res.redirect("/profile");
})

module.exports = router;