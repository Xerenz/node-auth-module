const passport = require("passport");
const bodyParser = require("body-parser");

const User = require("../models/user");

const urlencodedParser = bodyParser.urlencoded({ extended : false });

var error = null;

/*Controller for Authentication*/

module.exports = function(app) {

    app.get("/login", (req, res) => {
        res.render("login", {error : error});
    });

    app.get("/signup", (req, res) => {
        res.render("signup", {error : error});
    });

    app.get("/profile", (req, res) => {
        res.send("This is your profile page");
    });

    app.post("/login", urlencodedParser, (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                // handle errors

                if (err.name === 'IncorrectPasswordError' || 
                    err.name === 'IncorrectUsernameError') {
                    error = "The username or password is incorrect";
                    console.log(err);
                    return res.redirect("/login");
                }     
                console.log(err);
                error = "There seems to be a problem please try again later!";
                return res.redirect("/login");
            }

            req.logIn(user, err => {
                if (err) {
                    error = "Something went wrong please try again";
                    console.log(err);
                    return res.redirect("/login");
                }
                console.log("user successfully loggedIn");
                return res.redirect("/profile");
            });

        })(req, res, next);
    });

    app.post("/signup", urlencodedParser, (req, res, next) => {
        let newUser = User({
            name : req.body.name,
            phone : req.body.phone,
            username : req.body.username
        });

        User.register(newUser, req.body.password, (err, user) => {
            if (err) {
                // handle common errors here

                if (err.name === 'UserExistsError') {
                    error = "Username already exists!";
                    console.log(error);

                    res.redirect("/signup");
                }
                else {
                    error = "Something seems to be wrong! Please try again after some time";
                    console.log(error, err);

                    res.redirect("/signup");
                }
            }

            passport.authenticate("local", (err, user, info) => {
                if (err) {
                    console.log(err);
                    return next(err);
                }

                if (!user) {
                    console.log("No user object here");
                    error = "Please try login again.";
                    return res.redirect("/login");
                }

                req.logIn(user, err => {
                    if (err) {
                        error = "Something went wrong please try again";
                        console.log(err);
                        return res.redirect("/login");
                    }
                    console.log("logging the user");
                    return res.redirect("/profile");
                });

            })(req, res, next);            
        });
    });
}