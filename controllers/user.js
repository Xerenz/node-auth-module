const User = require("../models/user");
const bodyParser = require("body-parser");

const urlencodedParser = bodyParser.urlencoded({ extended : false});

module.exports = function(app) {

    app.get("/login", (req, res) => {
        res.render("login");
    });

    app.get("/signup", (req, res) => {
        res.render("signup");
    });

    app.get("/profile", (req, res) => {

    });

    app.post("/login", (req, res) => {

    });

    app.post("/signup", (req, res) => {

    });
}