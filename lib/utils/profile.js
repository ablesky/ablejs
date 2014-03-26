/**
 * utils - An util to access profile.json.
 */

// node libs.
var path = require('path');

// internal libs.
var log = require('../utils/log');
var file = require('../utils/file');
var mimes = require('../common/mimes');

// A profile for build content.
var jsonFileName = 'profile.json';
var jsonPath = path.join(mimes.js.src_path, jsonFileName);
var pjson;

function loadProfile() {
    if (file.exists(jsonPath)) {
        try {
            pjson = file.readJSON(jsonPath);
        } catch (e) {
            log.error(e);
        }
    } else {
        log.debug('ENOENT, no profile.json at "' + mimes.js.src_path + '"');
        pjson = {};
    }

    if (!pjson.concat) {
        pjson.concat = {};
    }
    if (!pjson.modules) {
        pjson.modules = [];
    }
}

loadProfile();

// profile real path.
exports.getPath = function () {
    return jsonPath;
};

exports.getFileName = function () {
    return jsonFileName;
};

exports.load = function() {
    loadProfile();
};

exports.reloadConfig = function() {
    this.load();
};

/**
 * [getConcats description]
 * @param  {String} rootDir [description]
 */
exports.getConcats = function(rootDir) {
    var obj = Object.create(Object.prototype);
    var files = pjson.concat[rootDir] || {};

    Object.keys(files).forEach(function(ele, i, array) {
        obj[ele] = files[ele].map(function(filename) {
            return filename;
        });
    });

    return obj;
};

exports.getModules = function() {
    return pjson.modules;
};