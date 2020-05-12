"use strict";

const fs = require('fs');
const path = require('path');
const jp = require('jsonpath');

const Document = require('./document');

/**
 * Folder reference
 */
class Folder {
    /**
     * Create folder reference.
     * @param {String} path path to folder.
     */
    constructor(path) {
        this.path = path;
    }

    /**
     * Find a list of document with a given query.
     * @param {Object} args {"query": "value"}.
     * @param {documentListCallback} callback
     */
    findDocs(args, callback) {
        var docs = [];
        var query = Object.keys(args)[0];
        var value = args[query];

        

        // get list of files.
        fs.readdir(this.path, (err, files) => {

            // iterate trough every file.
            for (const file of files) {
                var p = path.join(this.path, file);
                var data = require(p);
                var result = jp.query(data, query); // get query result.  
                
                
                
                // if there is result add Document object to list.
                if (result.length > 0) {
                    for (const val of result) {
                        if (val == value) {
                            
                            docs.push(new Document(p));
                            break;
                        }
                    }
                }
            }            

            // return documents list.
            callback(docs);
        });
    }

    /**
     * Create a new document.
     * @param {String} name Document name (is also the name of the file).
     * @param {Object} [data] Object to save in the document.
     * @param {documentCallback} [callback]
     */
    createDoc(name, data = {}, callback = () => { }) {
        var newPath = path.join(this.path, `${name}.json`); // make new path for document.

        // check if document exists
        fs.exists(newPath, exists => {
            if (exists) {
                callback(undefined, new Error("Document already exists.")); // return an error if document exists
            } else {
                // else create file and return Document object
                fs.writeFile(newPath, JSON.stringify(data), err => {
                    callback(new Document(newPath), undefined);
                });
            }
        });
    }

    /**
     * Create a new document synchronous.
     * @param {String} name Document name.
     * @param {Object} [data] Object to save in the document.
     * @returns {Document} Created document.
     */
    createDocSync(name, data = {}) {
        var newPath = path.join(this.path, `${name}.json`); // make new path for document.

        if (fs.existsSync(newPath)) {
            return;
        } else {
            fs.writeFileSync(newPath, JSON.stringify(data));

            return new Document(newPath);
        }
    }

    /**
     * Open a document
     * @param {String} name Name of the document to open
     * @param {documentCallback} callback
     */
    openDoc(name, callback) {
        var p = path.join(this.path, `${name}.json`); // get path to document

        // check if document exists
        fs.exists(p, exists => {
            if (exists) {
                callback(new Document(p), undefined); // return Document object if document exists.
            } else {
                callback(undefined, new Error("Document does not exists.")); // return an error if document does not exist.
            }
        });
    }

    /**
     * Open document synchronous.
     * @param {String} name Document name.
     * @returns {Document} opened document.
     */
    openDocSync(name) {
        var p = path.join(this.path, `${name}.json`); // get path to document.

        if (fs.existsSync(p)) {
            return new Document(p);
        } else {
            return;
        }
    }
}

/**
 * @callback documentCallback
 * @param {Document} doc Document reference.
 * @param {Error} err Error.
 */

/**
 * @callback documentListCallback
 * @param {Document[]} doc List of Document references.
 * @param {Error} err Error.
 */

module.exports = Folder;