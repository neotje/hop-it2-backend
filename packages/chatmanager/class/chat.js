const Message = require('./message');
const Member = require('./member');
const shortid = require('shortid');

/**
 * Chat class is used to send and manage messages of a chat.
 */

class Chat {
    /**
     * Create new Chat reference.
     * @param {Document} doc chat document reference.
     */
    constructor(doc) {        
        this.doc = doc;
    }

    /**
     * Chat ID.
     * @type {String}
     */
    get id() {
        return this.doc.name;
    }

    /**
     * last message send in this chat
     * @type {Message}
     */
    get lastMessage() {
        if (this.doc.data.lastmessage != '') {            
            return new Message(this.doc, this.doc.data.lastmessage);
        } else {            
            return;
        }
        
    }

    /**
     * List of messages in this chat
     * @type {Message[]}
     */
    get messages() {
        var arr = [];
        
        for (const id in this.doc.data.messages) {
            arr.push(new Message(this.doc, id));
        }

        return arr;
    }

    /**
     * list of member objects.
     * @type {Member[]}
     */
    get members() {
        var arr = [];

        this.doc.data.members.forEach(member => {
            arr.push(new Member(member));
        });

        return arr;
    }

    /**
     * Return true if given id is a member of the chat.
     * @param {String} id member id or group.
     * @returns {bool}
     */
    isMember(id) {
        for (const member of this.doc.data.members) {
            if (member == id) {
                return true;
            }
        }
        return false;
    }

    /**
     * Add message to chat send from a member.
     * @param {String} member member id or group.
     * @param {String} content content of the message.
     * @param {sendCallback} [callback]  
     */
    send(member, content, callback = ()=>{}) {
        // check if given member is a member of this chat
        if (this.isMember(member)) {
            var newId = shortid.generate(); // generate new chat id
            
            this.doc.data.messages[newId] = {
                sender: member,
                content: content,
                date: Date.now(),
                read: false
            };

            this.doc.data.lastmessage = newId;

            this.doc.save(err => {
                if (err) return callback(undefined, err);
                callback(new Message(this.doc, newId))
            });
        } else {
            callback(undefined, new Error('is not a member'));
        }
    }

    /**
     * 
     * @param {*} callback 
     */
    onMessage(callback) {
        this.doc.onChange((data, diff) => {
            callback(new Message(data.lastMessage));
        });
    }
}

/**
 * Callback after sending a message
 * 
 * @callback sendCallback
 * @param {Message} newMessage message that has been send.
 * @param {Error} err defined if there has been an error.
 */

module.exports = Chat;