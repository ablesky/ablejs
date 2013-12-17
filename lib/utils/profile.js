/**
 * utils - profile.
 */

// internal libs.
var file = require('../utils/file');

// A profile for build content.
var pjson = file.readJSON('dist/profile.json');

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