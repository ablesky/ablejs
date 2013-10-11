/**
 * utils - process the file content dependency.
 */

'use strict';

// node libs.
var path = require('path');
var execFile = require('child_process').execFile;

// internal libs.
var log = require('./log');
var file = require('./file');
var filemap = require('./filemap');

// using the regular expression literal.
var rpathExpr = /\/?((([-\.\w]+\/)*[-\.\w]+)\.(js|css|png|jpe?g|gif|ico)\b)/g;

function getAllFileMap() {
    return filemap.getAll();
}

/**
 * @method find
 * @description find the file content dependencies.
 * @param {String} file content.
 */
exports.find = function(content) {
    var dependencies = [];

    var ret = null;
    var _fname, _fmodule, _ftype;

    while ((ret = rpathExpr.exec(content)) != null) {
        _fname = ret[1];
        _fmodule = ret[2];
        _ftype = ret[4];

        dependencies.push(_fmodule + '.' +_ftype);
    }

    return dependencies;
};

/**
 * @description process dependencies.
 * @param {String} wdata the file content.
 * @param {Array} wdepends the file dependencies.
 * @param {Object} filemap
 */
exports.process = function(wdata, wdepends, filemap) {
    wdepends.forEach(function(element) {
        if (filemap[element]) {
            wdata = wdata.replace(element, filemap[element].fingerprint + path.extname(element)); 
        }
    });

    return wdata;
};

/**
 * @method backtrace
 * @description find the files which depends the relpath.
 * @param {String} relpath the file relative path.
 */
exports.backtrace = function(fingerprint) {

    var dependencies = [];
    var wdata = file.read(filepath);

    var fileType = path.extname(sourceFile).replace(/^\./, '');
    var ret = null;

    while ((ret = rpathExpr.exec(wdata)) != null) {
        _fname = ret[1];
        _fmodule = ret[2];
        _ftype = ret[4];
        _rhash = hashMap[_ftype][_fmodule];

        if (_rhash) {
            rpathExpr.lastIndex += _rhash.length + 1;
            wdata = wdata.replace(new RegExp(_fname), _rhash + '.' + _ftype); // _fmodule + '-' + 
        }

        dependencies.push(_fmodule);
    }

    return dependencies;
};
