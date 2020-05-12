const db = require('../datamanager');
const shortid = require('shortid');

const Chat = require('./class/chat');

/**
 * ChatManager module
 * @module ChatManager
 * @todo Support for groupchats.
 */

/**
 * Create new chat.
 * @param {String[]} members Array of member id or group name.
 * @param {chatCallback} callback
 */
function create(members, callback) {
    db.openFolder('chats', folder => {
        let newChatId = shortid.generate();
        folder.createDoc(newChatId, {
            messages: {},
            lastmessage: "",
            members: members
        }, doc => {
            let newChat = new Chat(doc);

            callback(newChat);
        });
    });
}

/**
 * Open a chat by ID.
 * @param {String} id chat id.
 * @param {chatCallback} callback 
 */
function open(id, callback) {
    db.openFolder('chats', folder => {
        folder.openDoc(id, (doc, err) => {
            if (err) {
                callback(undefined, err);
            } else {
                callback(new Chat(doc));
            }
        });
    });
}

/**
 * get list of chats by member/user ID.
 * @param {String} member member/user ID.
 * @param {chatListCallback} callback 
 */
function getByMember(member, callback) {
    db.openFolder('chats', folder => {
        folder.findDocs({"$.members..*": member}, docs => {
            var chats = []

            for (let doc of docs) {
                chats.push(new Chat(doc));
            }
            
            callback(chats);
        })
    });
}

module.exports = {
    create: create,
    open: open,
    getByMember: getByMember,
    socket: require('./socket')
}

/**
 * @callback chatCallback
 * @param {Chat} chat chat reference.
 * @param {Error} [err] Error.
 */

 /**
 * @callback chatListCallback
 * @param {Chat[]} chat chat reference.
 * @param {Error} [err] Error.
 */