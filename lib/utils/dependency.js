/**
 * utils - process the file content dependency.
 */

'use strict';

// node libs.
var path = require('path');

// external libs.
// https://github.com/pahen/madge
var madge = require('madge'); 

// using the regular expression literal.
var rpathExpr = /\/?((([-\.\w]+\/)*[-\.\w]+)\.(js|css|png|jpe?g|gif|ico)\b)/g;
var treePaths = [];


function analysisDependsTree(src, format) {
    if (treePaths[src] === undefined) {
        treePaths[src] = madge(src, {
            format: format || 'amd'
        }).tree;
    }

    return treePaths[src];
}

exports.tree = function(src, nocache) {
    var dependsTree = [];

    if (treePaths[src] !== undefined || nocache) {
        dependsTree = analysisDependsTree(src);
    } else {
        dependsTree = treePaths[src];
    }

    return dependsTree;
};

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
