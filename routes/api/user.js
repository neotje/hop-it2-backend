"use strict";

const express = require('express');
const router = express.Router();
const users = require('../../packages/usermanager');
const chats = require('../../packages/chatmanager');

//=== GET ===//
router.get("/current", function (req, res) {
    console.log(1, req.session.id);

    users.parseSession(req.session, (user, err) => {
        if (err) {
            res.status(500).json({
                error: err.message
            });
        } else {
            // send basic info about user.
            res.json({
                email: user.email,
                personal: user.personal,
                permissions: user.permissions
            });
        }
    });
});

router.get("/logout", function (req, res) {
    if (req.session.user) {
        req.session.destroy();
        res.json({
            error: false
        });
    } else {
        res.json({
            error: 'please login first'
        });
    }
});

//=== POST ===//
router.post("/register", function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var personal = req.body.personal;
    var message = req.body.message;

    if (email && password) {
        // login user when email and password are not empty
        users.register(email, password, personal, { group: 'user' }, (user, err) => {
            console.log(user);

            if (err) {
                // send error as response if login failed
                res.json({
                    error: err.message
                });
            } else {
                // create chat
                chats.create([user.id, '00000000'], (chat, err) => {
                    if (err) {
                        res.status(500).json({ error: true });
                    } else {
                        if (message) {
                            // send first message.
                            chat.send(user.id, message, (msg, err) => {
                                if (err) {
                                    res.status(500).json({ error: true })
                                } else {
                                    // send basic info about user.
                                    res.json({
                                        error: false,
                                        user: {
                                            email: user.email,
                                            personal: user.personal
                                        }
                                    });
                                }
                            });
                        } else {
                            // send basic info about user.
                            res.json({
                                error: false,
                                user: {
                                    email: user.email,
                                    personal: user.personal
                                }
                            });
                        }
                    }
                });
            }
        })
    } else {
        // send back an error message when email or password is empty.
        res.json({
            error: 'please enter email and password'
        });
    }
});


router.post("/login", function (req, res) {    
    var email = req.body.email;
    var password = req.body.password;

    // check if email and password are not empty.
    if (email && password) {

        // login user when email and password are not empty
        users.login(email, password, (user, err) => {
            if (err) {
                // send error as response if login failed
                res.status(500).json({
                    error: err.message
                });
            } else {
                req.session.user = user; // add user to session.

                console.log(2, req.session.id);

                console.log(req.session);


                // send basic info about user.
                res.json({
                    email: user.email,
                    personal: user.personal,
                    permissions: user.permissions
                });
            }
        })
    } else {
        // send back an error message when email or password is empty.
        res.status(500).json({
            error: 'please enter email and password'
        });
    }
});

router.post("/verify", function (req, res) {
    var token = req.body.token;

    if (token) {
        users.verify(token, (result) => {
            if (result) {
                res.json({
                    error: false
                });
            } else {
                res.json({
                    error: 'token is not valid'
                });
            }
        });
    } else {
        res.json({
            error: 'token is not valid'
        });
    }
});

router.post("/changePassword", function (req, res) {
    if (req.session.user) {
        var oldPass = req.body.old;
        var newPass = req.body.new;

        if (oldPass && newPass && oldPass != "" && newPass != "") {
            if (oldPass != newPass) {
                users.parseSession(req.session, (user, err) => {
                    if (err) {

                        res.json({
                            error: "user does not exist"
                        });

                    } else {

                        user.changePassword(oldPass.trim(), newPass.trim(), err => {
                            if (err) {
                                res.json({
                                    error: err.message
                                });
                            } else {
                                res.json({
                                    error: false
                                });
                            }
                        });

                    }
                });
            } else {
                res.json({
                    error: 'old and new password can not match each other'
                });
            }
        } else {
            res.json({
                error: 'can not be empty'
            });
        }


    } else {
        res.json({
            error: 'please login first'
        });
    }
});

module.exports = router;