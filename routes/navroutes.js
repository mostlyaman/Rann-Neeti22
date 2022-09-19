const { userDetails, findTeamById, findUserTeams, findAllHeads } = require("../utils")
const { authCheck, liveCheck } = require("../middleware/auth");
const router = require("express").Router();

router.get("/profile", [authCheck, liveCheck], async (req, res) => {

    const userDetail = await userDetails(req.user);
    const userTeams = await findUserTeams(req.user);

    context = {
        user: userDetail,
        teams: userTeams,
        authenticated: req.isAuthenticated(),
        message: req.flash("message")
    }
    // users team
    res.render("profile", context);
})

router.get("/ourteam", async (req, res) => {
    const heads = await findAllHeads();
    const context = {
        authenticated: req.isAuthenticated(),
        heads: heads
    }

    console.log(heads)
    res.render('ourteam.ejs', context);
})

module.exports = router