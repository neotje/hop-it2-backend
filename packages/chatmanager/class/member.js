const userManager = require('../../usermanager');

/**
 * Class to manage a member from a chat.
 */
class Member {
    /**
     * create new Member object.
     * @param {String} member member/user id
     */
    constructor(member) {
        /** @type {String} */
        this.id = member;
    }

    /**
     * get personalobject
     * @type {personalObject}
     */
    get personal() {
        var user = userManager.getSync(this.id);

        return user.personal;
    }

    /**
     * get personal info of chat member.
     * @param {personalCallback} callback 
     */
    getPersonal(callback) {
        userManager.get(this.id, (user, err) => {
            if (err) return callback();

            callback(user.personal);
        });
    }
}

/**
 * callback for getting personal info.
 * 
 * @callback personalCallback
 * @param {personalObject} personalInfo Personal info of the member.
 */

/**
 * @typedef {Object} personalObject
 * @property {String} firstname
 * @property {String} lastname
 */

module.exports = Member;