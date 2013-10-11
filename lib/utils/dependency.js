/**
 * utils - process the file content dependency.
 */

'use strict';

// node libs.
var path = require('path');

// internal libs.
var filemap = require('./filemap');

// using the regular expression literal.
var rpathExpr = /\/?((([-\.\w]+\/)*[-\.\w]+)\.(js|css|png|jpe?g|gif|ico)\b)/g;

function getAllFileMap() {
    return filemap.getAll();
}

/**
 * @method find
 * @description find the file content dependencies.
 * @param {String} "file content."
 */
exports.find = function(content) {
    var dependencies = [];

    var ret = null;
    var _fname, _fmodule, _ftype;

    while ((ret = rpathExpr.exec(content)) != null) {
        _fname = ret[1];
        _fmodule = ret[2];
        _ftype = ret[4];

        dependencies.push(_fmodule + '.' + _ftype);
    }

    return dependencies;
};

/**
 * @description process dependencies.
 * @param {String} wdata    "the file content."
 * @param {Array} wdepends  "the file dependencies."
 */
exports.process = function(wdata, wdepends) {
    var filemap = getAllFileMap();

    wdepends.forEach(function(element) {
        if (filemap[element]) {
            wdata = wdata.replace(element, filemap[element].fingerprint + path.extname(element));
        }
    });

    return wdata;
};

/**
 * @method backtrace
 * @description find the files which depends on the identifier.
 * @param {String} identifier
 * @return {Array} "the collections of files."
 */
exports.backtrace = function(identifier) {
    var dependencies = [];
    var filemap = getAllFileMap();

    for (var i in filemap) {
        if (filemap[i].dependencies.indexOf(identifier) > -1) {
            dependencies.push(i);
        }
    }

    return dependencies;
};