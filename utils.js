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
    },
    createTeam: async function (req, event) {
        const userTable = require("./models/user");
        const teamTable = require("./models/team");
        const eventTable = require("./models/event")
        const userDetail = await userTable.findOne({ googleId: req.user.googleId });
        const { TeamName } = req.body;


        // creating a new entry in team table
        var newteam = new teamTable({
            event: event._id,
            name: TeamName,
            teamLeader: req.user._id,
        });

        newteam.save(function (err) {
            if (err) {
                console.log(err.errors);
                return false;
            }
        });

        // updating the team id of the leader
        await userTable.updateOne({ googleId: userDetail.googleId }, { $set: { teamId: newteam._id } })

        // add the user to registered user of the event
        await eventTable.updateOne({ _id: event._id }, { $push: { registeredUsers: userDetail._id } });


        return true;
    }
};