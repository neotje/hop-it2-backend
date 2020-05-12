"use strict";

const db = require('../datamanager');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const path = require('path');

const User = require('./class/user');

var userSessions = {}

/**
 * UserManager module
 * @module UserManager
 */

/**
 * Register a new user. and send a verification mail.
 * @param {String} email Email of the new user.
 * @param {String} password Password of the new user.
 * @param {Object} personal Personal info of the new user.
 * @param {String} personal.firstname firstname.
 * @param {String} personal.lastname lastname.
 * @param {userCallback} callback
 */
exports.register = function register(email, password, personal, permissions, callback) {
    db.openFolder('users', folder => { // open users folder

        folder.findDocs({ "$.email": email }, docs => {   // check if user already exists.          
            if (docs.length == 0) {
                // create new user when user does not exist.

                var newID = shortid.generate(); // generate new id
                password = bcrypt.hashSync(password, 10); // hash password

                // create document with new user data.
                folder.createDoc(newID, {
                    email: email,
                    password: password,
                    personal: personal,
                    permissions: permissions,
                    verification: {
                        token: '',
                        date: Date.now(),
                        verified: false
                    },
                    recovery: {
                        token: '',
                        data: null
                    }
                }, doc => {
                    var newUser = new User(doc); // create new user class from document.

                    newUser.isPasswordVerified = true;

                    // verify password and send verification mail
                    newUser.sendVerification(err => { console.error(err); });

                    callback(newUser);
                });
            } else {
                callback(undefined, new Error('user already exists'));
            }
        });
    });
}

/**
 * Login user.
 * @param {String} email User's email address.
 * @param {String} password User's password.
 * @param {userCallback} callback
 */
exports.login =  function login(email, password, callback) {
    db.openFolder('users', folder => {
        folder.findDocs({ "$.email": email }, docs => {
            if (docs.length == 1) {
                var user = new User(docs[0]);

                if (user.verifyPassword(password)) {
                    if (user.isVerified) {
                        callback(user);
                    } else {
                        callback(undefined, new Error('please verify account first.'));
                    }
                } else {
                    callback(undefined, new Error('user does not exist.'));
                }
            }

            if (docs.length == 0) {
                callback(undefined, new Error('user does not exist.'));
            }

            if (docs.length > 1) {
                callback(undefined, new Error('internal server error.'));
            }
        })
    });
}

/**
 * get user by id.
 * @param {String} id User id.
 * @param {userCallback} callback 
 */
exports.get = function get(id, callback) {
    db.openFolder('users', folder => {
        folder.openDoc(id, (doc, err) => {
            if (err) return callback(undefined, err);

            callback(new User(doc));
        });
    });
}

/**
 * get user by id synchronous.
 * @param {String} id User id
 * @returns {User}
 */
exports.getSync = function getSync(id) {
    var folder = db.openFolderSync('users');
    var doc = folder.openDocSync(id);

    if (doc) {
        return new User(doc);
    } else {
        return;
    }
}

/**
 * Search a user by verification token and use that token.
 * @param {String} token Verification token.
 * @param {boolCallback} callback 
 */
exports.verify = function verify(token, callback) {
    db.openFolder('users', folder => {
        folder.findDocs({ "$.verification.token": token }, docs => {
            if (docs.length == 1) {
                var user = new User(docs[0]);

                user.verify(token, callback);
            }

            if (docs.length == 0) {
                callback(false);
            }

            if (docs.length > 1) {
                callback(false);
            }
        })
    })
}

/**
 * convert session to user
 * @param {express-session} session express session
 * @param {userCallback} callback
 */
exports.parseSession = function parseSession(session, callback) {
    if (session.user) {
        db.openFolder('users', folder => {
            folder.openDoc(path.basename(session.user.doc.path, '.json'), (doc, err) => {
                if (err) {
                    callback(undefined, new Error('user does not exist'));
                } else {
                    callback(new User(doc));
                }
            });
        });
    } else {
        return callback(undefined, new Error('login first'));
    }
}

/**
 * @callback userCallback
 * @param {User} user User object.
 * @param {Error} err Error.
 */

