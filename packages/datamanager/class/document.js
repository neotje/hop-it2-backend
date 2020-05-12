"use strict";

const fs = require('fs');
const path = require('path');
const diff = require("deep-object-diff").diff;

/**
 * Document reference.
 */
class Document {
    /**
     * Creates a document reference.
     * @param {String} p path to document
     */
    constructor(p) {
        this.path = p;
        this.data = require(p);

        this.onChange(data => {
            this.data = require(this.path);
        });
    }
    
    /**
     * last modified
     * @type {Date}
     */
    get lastModified() {
        return fs.statSync(this.path).mtime;
    }

    /**
     * Created
     * @type {Date}
     */
    get created() {
        return fs.statSync(this.path).birthtime;
    }

    /**
     * Document name
     * @type {String}
     */
    get name() {
        return path.basename(this.path, '.json');
    }

    /**
     * Listen to document changes.
     * @param {Function} callback callback(data, diff)
     */
    onChange(callback) {
        fs.watch(this.path, "utf8", (event, filename) => {
            var newData = require(this.path);
            callback(newData, diff(this.data, newData).list);
        });
    }

    /**
     * Save document to file.
     * @param {errorCallback} callback
     */
    save(callback) {
        fs.writeFile(this.path, JSON.stringify(this.data), err => {
            if (err) return callback(err);
            callback(undefined);
        });
    }
}

module.exports = Document;