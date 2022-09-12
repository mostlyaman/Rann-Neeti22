module.exports = { // event functions ===================================================================================================================================
    findAllEvents: async function (req) {
        const events = require("./models/event");

        let eventList = await events.find({}).lean();
        return eventList;
    },
    findEvent: async function (params) {
        const eventTable = require("./models/event");
        const event = await eventTable.findOne({ name: params }).lean();
        return event;
    },// user functions ===================================================================================================================================
    userDetails: async function (user) {
        const userTable = require("./models/user");
        const userDetail = await userTable.findOne({ googleId: user.googleId });
        return userDetail;
    },
    findUserById: async function (user_id) {
        const userTable = require("./models/user");
        const userDetail = await userTable.findOne({ _id: user_id });

        return userDetail;
    },
    isRegisteredforEvent: async function (user, event) {

        const userTable = require("./models/user");

        let checker = false;
        if (event && user) {
            const userDetail = await userTable.findOne({ googleId: user.googleId });
            const registeredTeams = userDetail.teams;
            for (let i = 0; i < registeredTeams.length; i++) {
                if (registeredTeams[i].eventId.toString() == event._id.toString())
                    checker = true;
            }
        }
        return checker;
    },
    checkAtheleticEvents: async function (user, event) {
        const userTable = require("./models/user");

        let checker = false;
        if (event && user) {
            const userDetail = await userTable.findOne({ googleId: user.googleId });
            const registeredTeams = userDetail.teams;
            let count = 0;

            for (let i = 0; i < registeredTeams.length; i++) {
                let currentEvent = await module.exports.findEventById(registeredTeams[i].eventId);
                if (currentEvent.eventType === "atheletic")
                    count++;
            }

            if (count === 3)
                checker = true;
        }
        return checker;
    },
    findUserTeams: async function (user) {
        const userDetail = await module.exports.userDetails(user);
        const userTeams = userDetail.teams;
        let teams = [];

        for (let i = 0; i < userTeams.length; i++) {
            let team = await module.exports.findTeamById(userTeams[i].teamId)
            teams.push(team);
        }
        return teams;

    },
    // team functions ===================================================================================================================================
    createTeam: async function (req, event) {
        const userTable = require("./models/user");
        const teamTable = require("./models/team");
        const eventTable = require("./models/event")
        const userDetail = await userTable.findOne({ googleId: req.user.googleId });
        const { TeamName } = req.body;

        // check the validation that is the user registered for the event or not

        let checker = (await module.exports.isRegisteredforEvent(req.user, event)) || (await module.exports.checkAtheleticEvents(req.user, event));

        if (checker) {
            return false;
        }
        // validation is done

        // creating a new entry in team table
        var newteam = new teamTable({
            event: event._id,
            name: TeamName,
            teamLeader: userDetail._id,
        });

        newteam.save(function (err) {
            if (err) {
                console.log(err.errors);
            }
        });

        // updating the team id of the leader
        await userTable.updateOne({ googleId: userDetail.googleId }, { $push: { teams: { teamId: newteam._id, eventId: event._id } } });

        // add the user to registered user of the event
        await eventTable.updateOne({ _id: event._id }, { $push: { registeredUsers: { user_id: userDetail._id } } });

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
        const eventDetail = await module.exports.findEventById(teamDetail.event);

        if (teamDetail == null) {
            return false;
        }

        // validation for already registered user or not
        let checker = (await module.exports.isRegisteredforEvent(req.user, eventDetail)) || (await module.exports.checkAtheleticEvents(req.user, eventDetail));

        if (checker) {
            return false;
        }

        // first we have to check this team is full or not
        let maxTeamsize = eventDetail.teamSize;
        let currentTeamSize = teamDetail.members.length;

        if (maxTeamsize > currentTeamSize) {
            await userTable.updateOne({ googleId: userDetail.googleId }, { $push: { teams: { teamId: teamId, eventId: eventDetail._id } } });
            await eventTable.updateOne({ _id: teamDetail.event }, { $push: { registeredUsers: { user_id: userDetail._id } } });
            await teamTable.updateOne({ _id: teamId }, { $push: { members: { member_id: userDetail._id } } });
            return true;
        }
        else {
            return false;
        }
    },
    findTeamById: async function (teamId) {
        const teamTable = require("./models/team");
        const teamDetail = await teamTable.findOne({ _id: teamId });
        return teamDetail;
    },
    findAllMembersOfTeam: async function (team) {
        const mems = team.members;
        const memberDetails = []
        for (let i = 0; i < mems.length; i++) {
            let member = await module.exports.findUserById(mems[i].member_id);
            memberDetails.push(await module.exports.findUserById(mems[i].member_id));
        }

        return memberDetails;
    },
};