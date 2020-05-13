"use strict";

const express = require('express');
const router = express.Router();
const chats = require('../../packages/chatmanager');
const users = require('../../packages/usermanager');

//=== GET ===//
router.get('/list', function (req, res) {
    users.parseSession(req.session, (user, err) =>{
        if (err) {
            res.status(500).json({
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
                        if (member.id != user.id) {
                            response.chats.push({
                                name: `${member.personal.firstname} ${member.personal.lastname}`,
                                lastmessage: chat.lastmessage,
                                messages: chat.messages
                            });
                        }
                    }
                }

                res.json(response.chats);
            });
        }
    });
});

//=== POST ===//

module.exports = router;