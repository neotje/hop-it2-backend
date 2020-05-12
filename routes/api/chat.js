"use strict";

const express = require('express');
const router = express.Router();
const chats = require('../../packages/chatmanager');
const users = require('../../packages/usermanager');

//=== GET ===//
router.get('/list', function (req, res) {
    users.parseSession(req.session, (user, err) =>{
        if (err) {
            res.json({
                error: "user does not exist"
            });
        } else {
            chats.getByMember(user.id, (chats) => {
                var response = {
                    error: false,
                    chats: []
                }

                for (const chat of chats) {
                    for (const member of chat.members) {
                        if (member.id != "00000000") {
                            member.getPersonal(personal => {
                                response.chats.push({
                                    name: `${personal.firstname} ${personal.lastname}`,
                                    lastmessage: chat.lastmessage,
                                    messages: chat.messages
                                });
                            });
                        }
                    }
                }
            });
        }
    });
});

//=== POST ===//

module.exports = router;