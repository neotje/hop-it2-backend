"use strict";

const bcrypt = require('bcrypt');
const shortid = require('shortid');

const mailer = require('../../mailer');
const verificationTemplate = require('../template/verificationMail');
const recoveyrTemplate = require('../template/recoveryMail');
const config = require('../config');

/**
 * User class
 */
class User {
    /**
     * Create a user object from document.
     * @param {Document} doc document reference
     */
    constructor(doc) {
        this.doc = doc;
        this.isPasswordVerified = false;
    }

    /**
     * User ID.
     * @type {String}
     */
    get id() {
        return this.doc.name;
    }

    /**
     * User email.
     * @type {String}
     */
    get email() {
        return this.doc.data.email;
    }

    /**
     * User personal info.
     * @type {Object}
     */
    get personal() {
        return this.doc.data.personal;
    }

    /**
     * User verified state.
     * @type {Bool}
     */
    get isVerified() {
        return this.doc.data.verification.verified;
    }

    /**
     * User permissions
     * @type {Object}
     */
    get permissions() {
        return this.doc.data.permissions;
    }

    /**
     * this function generates new recovery token and send a mail with the token to the user.
     * @param {errorCallback} callback
     */
    requestRecovery(callback) {
        // generate new token and date
        this.doc.data.recovery = {
            token: shortid.generate,
            data: Date.now()
        }

        this.doc.save(err => {
            if (err) return callback(err);

            // send recovery mail.
            mailer.send(
                this.email,
                'Hop-IT wachtwoord herstellen',
                new recoveyrTemplate({
                    firstname: this.personal.firstname,
                    lastname: this.personal.lastname,
                    url: `${config.recoveryURL}${this.doc.data.recovery.token}`
                }),
                err => {
                    if (err) return callback(err);
                    callback();
                }
            )
        });
    }

    /**
     * Change user password.
     * @param {String} oldpassword old password.
     * @param {String} newpassword new password.
     * @param {errorCallback} callback 
     */
    changePassword(oldpassword, newpassword, callback) {
        if(this.verifyPassword(oldpassword)) {
            this.doc.data.password = bcrypt.hashSync(newpassword, 10);
            this.doc.save(err => {
                if (err) {
                    callback(err);
                } else {
                    callback();
                }
            });
        } else {
            callback(new Error('old password does not match'));
        }
    }

    /**
     * this function will check if the password matches the hash.
     * @param {String} password A password.
     * @returns {Boolean} password matches to hash.
     */
    verifyPassword(password) {
        console.log(password, this.doc.data.password);

        this.verifiedPassword = bcrypt.compareSync(password, this.doc.data.password);
        return this.verifiedPassword;
    }

    /**
     * Use verification token to verify account.
     * @param {Sting} token Verification token.
     * @param {boolCallback} callback 
     */
    verify(token, callback) {
        console.log(this.doc.data.verification.verified == false, token == this.doc.data.verification.token, Date.now() - this.doc.data.verification.date < config.tokenAge);
        
        if (this.doc.data.verification.verified == false && token == this.doc.data.verification.token && Date.now() - this.doc.data.verification.date < config.tokenAge) {
            this.doc.data.verification.verified = true;

            this.doc.save(err => {
                callback(true);
            })
        } else {
            callback(false);
        }
    }

    /**
     * Send a verification mail to user with new token.
     * @param {errorCallback} callback
     */
    sendVerification(callback) {
        // update user document with new token.
        var newToken = shortid.generate();
        this.doc.data.verification = {
            token: newToken,
            date: Date.now(),
            verified: false
        }

        // save the document
        this.doc.save(err => {
            if (err) return callback(err);

            // send a verification mail
            mailer.send(
                this.email, // user email
                'Hop-IT account verification', // subject
                new verificationTemplate({
                    firstname: this.personal.firstname,
                    lastname: this.personal.lastname,
                    url: `${config.verificationURL}${newToken}`
                }),
                (err) => {
                    if (err) { 
                        callback(err); 
                    } else {
                        callback();
                    } 
                }
            );
        });
    }
}

module.exports = User;

/**
 * @callback boolCallback
 * @param {Boolean} result true or false.
 */