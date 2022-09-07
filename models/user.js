const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name:
        {
            type: String,
            required: true,
        },
        phone:
        {
            type: String,
            required: true,
        },
        email:
        {
            type: String,
            required: true,
        },
        teamId: // the team that person belong to, if he is playing in any sport having team
        {
            type: String,
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
            required: true,
        }
    }
);

module.exports = mongoose.model("users", UserSchema);