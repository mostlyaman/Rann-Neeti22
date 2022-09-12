const { application } = require("express");
const { findAllEvents, findEvent, isRegisteredforEvent, createTeam, joinTeam, findTeamById, findAllMembersOfTeam, userDetails, findUserById } = require("../utils.js");

const router = require("express").Router();

router.get("/team", async (req, res) => {
    const teamId = req.query.teamId;
    const teamDetail = await findTeamById(teamId);
    const members = await findAllMembersOfTeam(teamDetail);
    const teamLeader = await findUserById(teamDetail.teamLeader);

    const context = {
        team: teamDetail,
        teamMembers: members,
        leader: teamLeader
    }
    res.render("teampage", context);
})

module.exports = router