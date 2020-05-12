"use strict";

const fs = require('fs');
const path = require('path');

const rootDir = path.dirname(require.main.filename);

// get config to determine the data folder.
const config = require('./config.json');

const Folder = require('./class/folder');

/**
 * DataManager module
 * @module DataManager
 */

/**
 * Create new Folder.
 * @param {String} name folder name
 * @param {folderCallback} callback
 */
exports.createFolder = function createFolder(name, callback) {
    // make new path for the new directory
    var newPath = path.join(rootDir, config.dataFolder, name);

    // check if directory already exists
    fs.exists(newPath, exists => {
        if (exists) {
            callback(undefined, new Error("folder already exists")); // if directory already exists return an error.
        } else {
            // else make dir and return Folder object.
            fs.mkdir(newPath, () => {
                callback(new Folder(newPath), undefined);
            });
        }
    });
}

/**
 * Create folder synchronous.
 * @param {String} name folder name
 * @returns {Folder} created folder
 */
exports.createFolderSync = function createFolderSync(name) {
    var newPath = path.join(rootDir, config.dataFolder, name);

    if (fs.existsSync(newPath)) {
        return
    } else {
        fs.mkdirSync(newPath);
        return new Folder(newPath);
    }
}

/**
 * Open a Folder
 * @param {String} name folder name 
 * @param {folderCallback} callback
 */
exports.openFolder = function openFolder(name, callback) {
    var p = path.join(rootDir, config.dataFolder, name);

    // check if directory exists
    fs.exists(p, exists => {
        if (exists) {
            callback(new Folder(p), undefined); // if exists return Folder object.
        } else {
            callback(undefined, new Error('folder does not exist')); // if folder doesn't exists return error.
        }
    });
}

/**
 * open folder synchronous.
 * @param {String} name folder name
 * @returns {Folder} opened folder
 */
exports.openFolderSync = function openFolderSync(name) {
    var p = path.join(rootDir, config.dataFolder, name);

    if (fs.existsSync(p)) {
        return new Folder(p);
    } else {
        return;
    }
}

/**
 * @callback folderCallback
 * @param {Folder} folder Folder reference.
 * @param {Error} err
 */