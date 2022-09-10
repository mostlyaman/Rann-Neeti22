const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        googleId:
        {
            type: String,
            required: true,
        },
        firstName:
        {
            type: String,
            required: true,
        },
        lastName:
        {
            type: String,
            required: true,
        },
        phoneNumber:
        {
            type: Number,
            required: true,
        },
        email:
        {
            type: String,
            required: true,
        },
        teamId: // the team that person belong to, if he is playing in any sport having team
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "team",
        },
        image:
        {
            type: String,
        },
        registeredAt:
        {
            type: Date,
            default: Date.now
        },
        college:
        {
            type: String,
        }
    }
);

module.exports = mongoose.model("users", UserSchema);