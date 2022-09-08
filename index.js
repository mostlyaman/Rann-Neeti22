const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const events = require("./models/event.js")
const users = require("./models/user.js")
const port = 5000;


const app = express();

app.set("views", "./templates")
app.set("view engine", "ejs")

app.use(express.static(__dirname + "/static"));
app.use("/images", express.static(__dirname + "static/images"));


app.get("/", async (req, res) => {
    res.render("home");
})

app.get("*", function (req, res) {
    res.status(404).send("<h1> Not Found! </h1>")
})

app.listen(port, (err) => {
    if (err) throw err;
    console.log("Connection done!");
})