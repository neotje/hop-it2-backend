"use strict";

const nodemailer = require("nodemailer");
const path = require('path');

const rootDir = path.dirname(require.main.filename);

// smtp settings from config
const config = require('./config.json');

// mail transporter
const transporter = nodemailer.createTransport(config);

/**
 * Mailer module
 * @module Mailer
 */

/**
 * A Template 
 * @typedef {object} Template
 * @property {String} compiledTemplate see {@tutorial mail-template}
 */

/**
 * send an email from "neo@hop-it.nl"
 * @param {String} to Email adres to send to.
 * @param {String} subject Email subject.
 * @param {(String|Template)} content Content of the email.
 * @param {errorCallback} callback callback(err)
 */
function send(to, subject, content, callback) {
    if (typeof(content) == 'object') {
        content = content.compiledTemplate;        
    }

    console.log(`Sending mail to ${to}...`);

    transporter.sendMail({
        from: 'Hop-IT <neo@hop-it.nl>',
        to: to,
        subject: subject,
        text: content,
        html: content
    }, (err, info) => {                
        if (err) {
            console.warn(`An error occured while sending a mail to ${to}.`, err);
            callback(err);
        } else {
            console.log(`Mail has been sent to ${to}.`);
            callback();
        }
    });
}

module.exports = {
    send: send
}