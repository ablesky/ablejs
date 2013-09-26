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

// using the regular expression literal.
var rpathExpr = /\/?((([-\.\w]+\/)*[-\.\w]+)\.(js|css|png|jpe?g|gif|ico)\b)/g;

/**
 * @method find
 * @description find the file content dependencies.
 * @param {string} filepath the file absolute path in os.
 */
exports.find = function(filepath) {

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


/**
 * @method backtrack
 * @description backtrack the file content dependencies.
 * @param {string} relpath the file relative path.
 */
exports.backtrack = function(relpath) {

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

// dependency.find('file/global.js')