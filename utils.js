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
    },
    findEventById: async function (eventId) {
        const eventTable = require("./models/event");
        const eventDetail = await eventTable.findOne({ _id: eventId });
        return eventDetail;
    },
    joinTeam: async function (teamId, req) {
        const teamTable = require("./models/team");
        const userTable = require("./models/user");
        const eventTable = require("./models/event")

        const teamDetail = await teamTable.findOne({ _id: teamId });
        const userDetail = await userTable.findOne({ googleId: req.user.googleId });
        const eventDetail = await this.findEventById(teamDetail.event);

        // we have to push this userid into team members column and update the user's team id to current teamDetail._id

        // first we have to check this team is full or not
        let maxTeamsize = eventDetail.teamSize;
        let currentTeamSize = teamDetail.members.length;

        if (maxTeamsize > currentTeamSize) {
            await userTable.updateOne({ googleId: req.user.googleId }, { $set: { teamId: teamId } });
            await eventTable.updateOne({ _id: teamDetail.event }, { $push: { registeredUsers: userDetail._id } });
            await teamTable.updateOne({ _id: teamId }, { $push: { members: userDetail._id } });

            res.redirect("/profile");
        }
        else
            res.send("Team full");
    },
    findTeamById: async function (teamId) {
        const teamTable = require("./models/team");
        const teamDetail = await teamTable.findOne({ _id: teamId });
        return teamDetail;
    },
};