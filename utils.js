const payment = require("./models/payment");

// Load config
require("dotenv").config({ path: "./config/config.env" });

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

            if (userDetail) {
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
        }
        return checker;
    },
    findUserTeams: async function (user) {
        const userDetail = await module.exports.userDetails(user);

        let teams = [];
        if (userDetail) {
            const userTeams = userDetail.teams;
            for (let i = 0; i < userTeams.length; i++) {
                let team = await module.exports.findTeamById(userTeams[i].teamId)
                if (team) {
                    let event = await module.exports.findEventById(team.event);
                    team.eventName = event.name;
                    teams.push(team);
                }
            }
        }
        return teams;

    },
    findAllPendingPayments: async function (user) {
        const teamTable = require("./models/team");


        let payments = [];
        const userDetail = await module.exports.userDetails(user);

        if (userDetail) {
            const teams = userDetail.teams;
            // check the hospitality fees is paid or not    



            if (userDetail.paymentStatus == 0) {
                payments.push({ paymentType: "user", amount: Number(process.env.AMOUNT), id: userDetail._id });
            }

            // check the teams fees, for the teams whose team leader is current user

            for (let i = 0; i < teams.length; i++) {
                let team = await teamTable.findOne({ _id: teams[i].teamId });
                if (team && team.teamLeader.toString() == userDetail._id.toString() && team.paymentStatus == 0) {
                    let event = await module.exports.findEventById(teams[i].eventId);
                    payments.push({ paymentType: "team", amount: event.fees, id: team._id, eventName: event.name });
                }
            }
        }

        return payments;
    },
    // team functions ===================================================================================================================================
    createTeam: async function (req, event) {
        const userTable = require("./models/user");
        const teamTable = require("./models/team");
        const eventTable = require("./models/event")
        const userDetail = await userTable.findOne({ googleId: req.user.googleId });
        const { TeamName } = req.body;

        // check if the hospitality fees paid or not

        if (userDetail && userDetail.paymentStatus == 0) {
            return "Sorry, you can't create a team before submitting accomadation charges!";
        }

        // check the validation that is the user registered for the event or not

        if (event && userDetail) {
            let checker = (await module.exports.isRegisteredforEvent(req.user, event)) || (await module.exports.checkAtheleticEvents(req.user, event));

            if (checker) {
                return "You can only register for atmost 3 atheletic events or already registered for this event";
            }

            // check any team with this name is already existing or not

            const existingTeam = await teamTable.findOne({ name: TeamName });

            if (existingTeam) {
                return "Team with team-name already exists!";
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


            return "Team created successfully!";
        }
        return "Sorry, unable to create team at this moment";
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


        if (teamDetail) {
            const eventDetail = await module.exports.findEventById(teamDetail.event);

            if (userDetail && userDetail.paymentStatus == 0) {
                return "Sorry, you can't join a team before submitting accomodation charges."
            }

            // validtion of team id
            if (teamDetail == null || userDetail == null || eventDetail == null) {
                return "Invalid Details";
            }

            // validation for already registered user or not
            let checker = (await module.exports.isRegisteredforEvent(req.user, eventDetail)) || (await module.exports.checkAtheleticEvents(req.user, eventDetail));

            if (checker) {
                return "You can only register for atmost 3 atheletic events or already registered for this event!";
            }

            // first we have to check this team is full or not
            let maxTeamsize = eventDetail.teamSize;
            let currentTeamSize = teamDetail.members.length;

            if (maxTeamsize > currentTeamSize + 1) {
                await userTable.updateOne({ googleId: userDetail.googleId }, { $push: { teams: { teamId: teamId, eventId: eventDetail._id } } });
                await teamTable.updateOne({ _id: teamId }, { $push: { members: { member_id: userDetail._id } } });
                return "Team joined successfully!"
            }
            else {
                return "Team already full!";
            }
        }
        else {
            return "Invaild Team ID";
        }
    },
    findTeamById: async function (teamId) {
        const teamTable = require("./models/team");
        const teamDetail = await teamTable.findOne({ _id: teamId });
        return teamDetail;
    },
    findAllMembersOfTeam: async function (team) {

        if (team) {
            const mems = team.members;
            const memberDetails = []
            for (let i = 0; i < mems.length; i++) {
                let member = await module.exports.findUserById(mems[i].member_id);
                if (member) {
                    memberDetails.push(await module.exports.findUserById(mems[i].member_id));
                }
            }

            return memberDetails;
        }

    },
    // delete a member of team
    deleteTeamMember: async function (teamId, memberId, user) {
        const teamTable = require("./models/team");
        const userTable = require("./models/user");

        const teamDetail = await teamTable.findOne({ _id: teamId });
        const userDetail = await userTable.findOne({ _id: memberId });
        const currentUser = await module.exports.userDetails(user);

        if (teamDetail && userDetail && (teamDetail.teamLeader.toString() == currentUser._id.toString())) {
            // delete this members team from user table

            for (let i = 0; i < userDetail.teams.length; i++) {
                if (userDetail.teams[i].teamId == teamId) {
                    userDetail.teams.splice(i, 1);
                }
            }

            await userDetail.save();
            // remove this user from teamMembers list

            for (let i = 0; i < teamDetail.members.length; i++) {
                if (teamDetail.members[i].member_id == memberId) {
                    teamDetail.members.splice(i, 1);
                }
            }

            await teamDetail.save();

            return true;
        }

        return false;
    },
    deleteTeam: async function (teamId, user) {
        const teamTable = require("./models/team");


        const teamDetail = await teamTable.findOne({ _id: teamId });
        const userDetail = await module.exports.userDetails(user);

        if (teamDetail && (teamDetail.teamLeader.toString() == userDetail._id.toString())) {
            if (teamDetail.paymentStatus == 0) {
                // remove all the members from team
                for (let i = 0; i < teamDetail.members.length; i++) {
                    await module.exports.deleteTeamMember(teamId, teamDetail.members[i].member_id);
                }

                // remove the leader from the team

                for (let i = 0; i < userDetail.teams.length; i++) {
                    if (userDetail.teams[i].teamId == teamId) {
                        userDetail.teams.splice(i, 1);
                    }
                }

                await userDetail.save();

                // delete the team from team database

                await teamTable.deleteOne({ _id: teamId });

                return true;
            }

            return false;
        }
        else
            return false;
    },
    // heads
    findAllHeads: async function () {
        const headTable = require("./models/heads")
        const heads = await headTable.find({}).lean();

        heads.sort(function (a, b) {
            return parseInt(a.order) > parseInt(b.order) ? 1 : -1;
        });
        return heads;
    }
};