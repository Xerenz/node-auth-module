const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const LocalStrategy = require("passport-local");

const User = require("./models/user");

mongoose.connect("mongodb://localhost/auth")
    .then(() => console.log("Mongo connected"))
    .catch(err => console.log("Error connecting Mongo"));


const app = express();


app.set("view engine", "ejs");

app.use(cookieParser());
app.use(session({
    secret : process.env.SECRET || "AUTH_SECRET_HERE",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
    res.send("Working properly");
});

PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log("listening to", PORT);
});