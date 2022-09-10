module.exports = {
    findAllEvents: async function (req) {
        const events = require("./models/event");

        let eventList = await events.find({}).lean();
        return eventList;
    },
    isRegisteredforEvent: function (user, event) {

        let checker = false;
        if (event && user) {
            for (let j = 0; j < event.registeredUsers.length; j++) {
                if (event.registeredUsers[j].user_id.toString() == user._id) {
                    checker = true;
                }
            }
        }
        return checker;
    },
    findEvent: async function (params) {
        const eventTable = require("./models/event");
        const event = await eventTable.findOne({ name: params }).lean();
        return event;
    },
    userDetails: async function (user) {
        const userTable = require("./models/user");
        const userDetail = await userTable.findOne({ googleId: user.googleId });
        return userDetail;
    }
};