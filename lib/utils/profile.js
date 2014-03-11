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
var jsonPath = path.join(mimes.js.src_path, 'profile.json');
var pjson;

if (file.exists(jsonPath)) {
    try {
        pjson = file.readJSON(jsonPath);
    } catch (e) {
        log.error(e);
    }
} else {
    log.warn('ENOENT, no profile.json at "' + mimes.js.src_path + '"');
    pjson = {
        concat: {},
        modules: []
    }
}

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