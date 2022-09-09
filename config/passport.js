// Google Oauth
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const user = require("../models/user");
// Load config
require("dotenv").config({ path: "./config/config.env" });

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:5000/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                return done(null, profile);
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        // User.findById(id, (err, user) => done(err, user));
        done(null, user)
    });
};