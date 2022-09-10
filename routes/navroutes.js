const { userDetails } = require("../utils")

const router = require("express").Router();

router.get("/profile", async (req, res) => {

    context = {
        user: await userDetails(req.user)
    }

    res.render("profile", context);
})


module.exports = router