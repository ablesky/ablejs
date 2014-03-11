/**
 * utils - An util to access profile.json.
 */

// node libs.
var path = require('path');

// internal libs.
var file = require('../utils/file');
var argv = require('../utils/argv');


var contextPath = argv.get('context-path');
var jsonPath = path.join(contextPath, JS_PATH, 'profile.json');
// A profile for build content.
var pjson = file.readJSON();

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