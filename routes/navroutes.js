const { userDetails, findTeamById } = require("../utils")

const router = require("express").Router();

router.get("/profile", async (req, res) => {

    const userDetail = userDetails(req.user);
    const userTeam = await findTeamById(userDetail.teamId);

    context = {
        user: await userDetails(req.user),
        team: userTeam
    }

    // users team
    res.render("profile", context);
})


module.exports = router