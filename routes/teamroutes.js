const { application } = require("express");
const { findAllEvents, findEvent, isRegisteredforEvent, createTeam, joinTeam, findTeamById, findAllMembersOfTeam, userDetails, findUserById, deleteTeamMember, deleteTeam } = require("../utils.js");
const { authCheck, liveCheck } = require("../middleware/auth");

const router = require("express").Router();

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
        user: req.user
    }
    res.render("teampage", context);
})

router.post("/team/deleteMember", [authCheck, liveCheck], async (req, res) => {
    const teamId = req.body.teamId;
    const memberId = req.body.memberId;

    await deleteTeamMember(teamId, memberId);
    res.redirect("/profile");
})

router.post("/team/deleteTeam", [authCheck, liveCheck], async (req, res) => {
    const teamId = req.body.teamId;
    await deleteTeam(teamId, req.user);
    res.redirect("/profile");
})
module.exports = router