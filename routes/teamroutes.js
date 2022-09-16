const { application } = require("express");
const { findAllEvents, findEvent, isRegisteredforEvent, createTeam, joinTeam, findTeamById, findAllMembersOfTeam, userDetails, findUserById } = require("../utils.js");
const { authCheck, liveCheck } = require("../middleware/auth");

const router = require("express").Router();

router.get("/ourteam", async (req, res) => {
    context = {
        authenticated: req.isAuthenticated()
    }
    res.render('ourteam.ejs', context);
})

router.get("/team", [authCheck, liveCheck], async (req, res) => {
    const teamId = req.query.teamId;
    const teamDetail = await findTeamById(teamId);

    if (teamDetail == null) {
        res.send("No such team found!");
        return;
    }

    const members = await findAllMembersOfTeam(teamDetail);
    const teamLeader = await findUserById(teamDetail.teamLeader);

    const context = {
        team: teamDetail,
        teamMembers: members,
        leader: teamLeader,
        user: req.user,
        authenticated: req.isAuthenticated()
    }
    res.render("teampage", context);
})

module.exports = router