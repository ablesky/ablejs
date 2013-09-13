/**
 * utils - file.
 */

'use strict';

// node libs.
var fs = require('fs');
var url = require('url');
var path = require('path');

// external libs.
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');


/**
 * file.exists(filepath)
 */
exports.exists = function(path) {
    try {
        fs.statSync(path);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * file.isFile(filepath)
 */
exports.isFile = function(filepath) {

    try {
        return fs.statSync(filepath).isFile();
    } catch (e) {
        return false;
    }
};

/**
 * file.isDir(filepath)
 */
exports.isDir = function(filepath) {
    try {
        return fs.statSync(filepath).isDirectory();
    } catch (e) {
        return false;
    }
};

/**
 * file.delete(filepath)
 */
exports.delete = function(filepath) {
    return rimraf.sync(filepath);
};

/**
 * Synchronous rename
 * file.rename(oldpath, newpath)
 */
exports.rename = function() {
    return fs.renameSync.apply(this, arguments);
};

/**
 * file.read(filepath [, encoding])
 */
exports.read = function(filepath, encoding) {
    if (!encoding) {
        encoding = 'utf8';
    }

    return fs.readFileSync(filepath, encoding);
};

/**
 * file.write(filepath, contents [, encoding])
 */
exports.write = function(filepath, contents, encoding) {
    if (!encoding) {
        encoding = 'utf8';
    }

    // Make sure destination directories exist.
    var parentDir = path.dirname(filepath);
    if (!exports.exists(parentDir)) {
        exports.mkdir(parentDir);
    }

    fs.writeFileSync(filepath, contents, encoding);
    return filepath;
};

/**
 * file.mkdir("/tmp/dir", 755)
 */
exports.mkdir = function(dirpath, mode) {
    mkdirp.sync(dirpath, mode);
    return dirpath;
};