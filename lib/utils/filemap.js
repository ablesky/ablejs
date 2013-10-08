/**
 * utils - filemap.
 */

'use strict';

// node libs.
var fs = require('fs');
var path = require('path');

// internal libs.
var file = require('./file');
var fingerprint = require('./fingerprint');
var dependency = require('./dependency');

var MAP_PATH = 'dist/filemap.json';
var filemap = file.readJSON(MAP_PATH);
var pkg = file.readJSON('package.json');

function needFindDepends(identifier) {
    var fileType = path.extname(identifier).replace(/^\./, '').toLowerCase();
    var flag = true;

    switch (fileType) {
        case 'gif':
        case 'png':
        case 'jpg':
        case 'jpeg':
            flag = false;
            break;
        case 'css':
        case 'js':
        case 'jsp':
            flag = true;
            break;
    }

    return flag;
}

/**
 * @example filemap.get(filepath)
 */
function get(identifier) {
    return filemap[identifier];
};

/**
 * @example filemap.set(identifier, obj)
 * @return {Object}
 */
function set(identifier, obj) {
    return filemap[identifier] = obj;
};

/**
 * @example filemap.getAll()
 */
exports.getAll = function() {
    return filemap;
};

/**
 * @example filemap.updateMap('dir/filename.js', TheIdentifierContent)
 * @param {String} identifier
 * @param {String} content
 */
exports.updateMap = function(identifier, content) {
    var dependencies = needFindDepends(identifier) ? dependency.find(content) : [];

    return set(identifier, {
        fingerprint: fingerprint.generate(content),
        dependencies: dependencies
    });
};

/**
 * @example filemap.save()
 */
exports.save = function() {
    file.write(MAP_PATH, JSON.stringify(exports.getAll()));
};