const router = require("express").Router();
const passport = require("passport");

// auth logout
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// auth with google+
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] })
);

// callback route for google to redirect to
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/error" }),
    function (req, res) {
        // console.log('req.user') // user info
        // Successful authentication, redirect success.
        if (process.env.NODE_ENV == "development") {
            res.redirect(req.session.returnTo || "/");
        } else if (process.env.NODE_ENV == "production") {
            res.redirect(
                req.session.returnTo || `https://${req.headers.host}/`
            );
            delete req.session.returnTo;
        } else {
            res.redirect(req.session.returnTo || "/");
            delete req.session.returnTo;
        }
    }
);

module.exports = router;