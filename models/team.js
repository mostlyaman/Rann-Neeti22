const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
    {
        name:
        {
            type: String,
            required: true,
            unique: true,
        },
        size:
        {
            type: Number,
            required: true,
        },
        event:
        {
            type: String,
            required: true,
        },
        teamLeader:
        {
            type: String,
            required: true,
        }
        ,
        members:
            [
                {
                    member_id: {
                        type: String,
                        required: true,
                    },
                },
            ]
        ,
        createdAt:
        {
            type: Date,
            default: Date.now,
        },
    }
);

module.exports = mongoose.model("teams", TeamSchema);