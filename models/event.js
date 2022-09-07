const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
    {
        name:
        {
            type: String,
            required: true,
        },
        content:
        {
            type: String,
            required: true,
        },
        event_image:
        {
            type: String,
            required: true,
        },
        rulebook_link:
        {
            type: String,
            required: true,
        },
        fees:
        {
            type: Number,
            required: true,
        },
        duration:
        {
            hours:
            {
                type: Number
            },
            minutes:
            {
                type: Number,
            }
        },
        venue:
        {
            type: String,
            required: true,
        }
    }
);

module.exports = mongoose.model("events", EventSchema);