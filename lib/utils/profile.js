/**
 * utils - profile.
 */

// node libs.
var path = require('path');

// internal libs.
var file = require('../utils/file');

// A profile for build content.
var pjson = file.readJSON('dist/profile.json');

/**
 * [getConcatFiles description]
 * @param  {[type]} fileType [description]
 * @param  {[type]} options  [description]
 * @return {[type]}          [description]
 */
exports.getConcatFiles = function(rootDir, baseDir) {
    var obj = Object.create(Object.prototype);
    var files = pjson.concat[rootDir] || {};

    Object.keys(files).forEach(function(ele, i, array) {
        obj[path.join(baseDir, ele)] = files[ele].map(function(filename) {
            return path.join(baseDir, filename);
        });
    });

    return obj;
};

exports.getModules = function() {
    return pjson.modules;
};