const async = require("async");
const crypto = require("crypto");
const passport = require("passport");
const nodemailer = require("nodemailer");
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

    app.get("/forgot", (req, res) => {
        res.render("forgot");
    });

    app.get("/reset/:token", (req, res) => {
        User.findOne({
            token : req.params.token,
            expires : {$gt : Date.now()}
        }, (err, user) => {
            if (err) return console.log(err);
            if (!user) return console.log("No user found");
            res.render("reset", {token : req.params.token});
        });
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

    app.post("/forgot", urlencodedParser, (req, res) => {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, (err, buff) => {
                    if (err) return done(err);
                    const token = buff.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                console.log("second function");
                User.findOne({username : req.body.email}, (err, user) => {
                    if (err) return done(err);
                    if (!user) return console.log("No user found!"); // redirect to forgot with error
                    
                    user.token = token;
                    user.expire = Date.now();

                    user.save(err => {
                        if (err) return done(err);
                        done(err, token, user);
                    });
                });
            },
            function(token, user) {
                let smtpTransporter = nodemailer.createTransport({
                    service : 'Gmail',
                    auth : {
                        user : 'tech.dhishna@gmail.com',
                        pass : 'JyothisDance@1337'
                    }
                });

                let message = {
                    to : user.username,
                    from : 'Dhishna <tech.dhishna@gmail.com>',
                    subject : 'Password Reset',
                    body : `Hello ${user.name},
                    
You are recieving this mail because you have asked to reset your password.

Please click on the following link or paste it in your browser to complete the process.

${req.headers.host + '/reset/' + token}

If you have not requested this please ignore this mail and your password will remain unchanged.

Regards,`
                }

                smtpTransporter.sendMail(message, err => {
                    done(err, 'done');
                });
            }
        ], err => {
            if (err) return console.log(err);
        });
    });

    app.post("/reset/:token", (req, res) => {
        async.waterfall([
            function(done) {
                User.findOne({
                    token : req.params.token,
                    expires : {$gt : Date.now()}
                }, (err, user) => {
                    if (err) return done(err);
                    if (!user) return console.log("No user found");

                    user.token = null;
                    user.expires = null;

                    user.setPassword(req.body.password, err => {
                        if (err) return done(err);
                        console.log("Password has been changed.");
                        done(err, user);
                    });
                });
            },
            function(user, done) {
                let smtpTransporter = nodemailer.createTransport({
                    service : 'Gmail',
                    auth : {
                        user : 'tech.dhishna@gmail.com',
                        pass : 'JyothisDance@1337'
                    }
                });

                let message = {
                    to : user.username,
                    from : 'Dhishna <tech.dhishna@gmail.com>',
                    subject : 'Password Reset',
                    body : `Hey ${user.name},

This is to confirm that your password for the account ${user.username} has been reset.`
                };

                smtpTransporter.sendMail(message, err => {
                    if (err) done(err);
                    console.log("Mail sent to", user.username);
                    done(err);
                });
            }
        ], err => {
            if (err) return console.log(err);
        });
    });
}