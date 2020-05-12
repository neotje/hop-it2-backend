"use strict";
require('console-stamp')(console, '[HH:MM:ss.l]');

const io = require('socket.io')();

const userManager = require('../usermanager');

/**
 * @namespace chatSocket
 */

io.on('connection', socket => {
    console.log('a client connected');

    if (socket.request.session.user) {
        console.log('the client is a logged in user.');

        // parse session
        userManager.parseSession(socket.request.session, (user, err) => {
            const chatManager = require('../chatmanager');
            // send message
            socket.on('sendMessage', (req) => {
                chatManager.open(req.id, (chat, err) => {
                    if (!err) {
                        chat.send(user.id, req.content);
                    }
                });
            });

            // sync chats with client
            chatManager.getByMember(user.id, chats => {
                // iterate throug all chats.
                for (const chat of chats) {

                    chat.onMessage(msg => {
                        if (msg.sender.id != user.id) {
                            msg.sender.getPersonal(personal => {

                                /**
                                 * @event chatSocket#newMessage
                                 * @type {object} 
                                 * @property {String} id Origin of message. Chat ID.
                                 * @property {String} content message content.
                                 * @property {String} sender sender of the message '{firstname} {lastname}'.
                                 */
                                socket.emit("newMessage", {
                                    id: chat.id,
                                    content: msg.content,
                                    sender: `${personal.firstname} ${personal.lastname}`
                                })
                            })
                        }
                    });

                    for (const member of chat.members) {
                        if (member.id != user.id) {
                            var personal = member.personal;
                            var messages = [];

                            for (const message of chat.messages) {
                                messages.push(message.toJSON());
                            }

                            var data = {
                                id: chat.id,
                                name: `${personal.firstname} ${personal.lastname}`,
                                messages: messages,
                                lastMessage: ''
                            }

                            if (chat.lastMessage) {
                                data.lastMessage = chat.lastMessage.toJSON();
                            }

                            /**
                             * @event chatSocket#addChat
                             * @type {object}
                             * @property {String} id Chat id.
                             * @property {String} name Chat name (name of reciever) '{firstname} {lastname}'.
                             * @property {object[]} messages List of messages in this chat. See {@link Message#toJSON}
                             * @property {String} lastMessage content of last message send in this chat.
                             */
                            socket.emit("addChat", data);
                        }
                    }
                }
            });
        });
    }

    socket.on('disconnect', () => {
        console.log('client disconnected');

    });
});

module.exports = io;