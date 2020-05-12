const Member = require('./member');

/**
 * Manage message properties.
 */
class Message {
    /**
     * create message object.
     * @param {Document} doc reference to parent chat document.
     * @param {String} id message ID.
     */
    constructor(doc, id) {
        /**
         * message id. 
         * @type {String} 
         */
        this.id = id;
        /** 
         * parent chat document. 
         * @type {Document}
         */
        this.doc = doc;

        console.log(this.id, this.doc);
        
    }

    /**
     * Message send date.
     * @type {Date}
     */
    get date() {
        console.log(this.id, this.doc);
        
        return new Date(this.doc.data.messages[this.id].date);
    }

    /**
     * Message sender.
     * @type {Member}
     */
    get sender() {
        return new Member(this.doc.data.messages[this.id].sender);
    }

    /**
     * Message content.
     * @type {String}
     */
    get content() {
        return this.doc.data.messages[this.id].content;
    }

    /**
     * Is message read by everyone.
     * @type {Bool}
     */
    get read() {
        return this.doc.data.messages[this.id].read;
    }

    /**
     * Convert message to object
     * @returns {messageObject}
     */
    toJSON() {
        console.log(this.id, this.doc);
        return {
            id: this.id,
            date: this.date,
            sender: {
                id: this.sender.id,
                personal: this.sender.personal
            },
            content: this.content,
            read: this.read
        }
    }

    /**
     * Set read stae to true if reciever read this message.
     * @param {String} member member id or group name.
     * @param {Function} callback callback(err)
     */
    readBy(member, callback) {
        if (member =! this.sender) {
            this.doc.data.messages[id].read = true;

            this.doc.save(err => {
                if (err) return callback(err);
                callback();
            })
        } else {
            callback(new Error("sender can't read it's own message"));
        }
    }
}

/**
 * @callback errorCallback
 * @param {Error} err Defined if there is an error.
 */

 /**
  * @typedef {Object} messageObject
  * @property {String} id Message id.
  * @property {Date} date Message send date.
  * @property {personalObject} sender
  * @property {String} content content of the message.
  * @property {Boolean} read read state of message.
  */
module.exports = Message;