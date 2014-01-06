/**
 * utils - process the file content dependency.
 */
/* jshint evil:true */

'use strict';

// external libs.
// https://github.com/pahen/madge
var madge = require('madge');

// using the regular expression literal.
var rpathExpr = /\/?((([-\.\w]+\/)*[-\.\w]+)\.(js|css|png|jpe?g|gif|ico)\b)/g;
var requireExpr = /[^.]\s*require\s*\(\s*(\[.+\])\s*\)/g;
var treePaths = [];

/**
 * use madge tool, get commonjs/amd tree.
 * @param  {String} src    [the base path for store js files]
 * @param  {String} format [module type]
 * @return {Object} 
 */
function analysisDependsTree(src, format) {
    if (treePaths[src] === undefined) {
        treePaths[src] = madge(src, {
            format: format || 'amd'
        }).tree;
    }

    return treePaths[src];
}

/**
 * get amd tree
 * @param  {String}  src     [description]
 * @param  {Boolean} nocache [description]
 * @return {Object}          [description]
 */
exports.tree = function(src, nocache) {
    var dependsTree = [];

    if (treePaths[src] === undefined || nocache) {
        dependsTree = analysisDependsTree(src);
    } else {
        dependsTree = treePaths[src];
    }

    return dependsTree;
};

/**
 * @method find
 * @description find the file content dependencies.
 * @param {String} fileId 'the file identifier'
 * @param {String} fileContent 'the file content.'
 */
exports.find = function(fileType, fileContent) {
    var dependencies = [];

    var ret = null;
    var _fname, _fmodule, _ftype;

    while ((ret = rpathExpr.exec(fileContent)) != null) {
        _fname = ret[1];
        _fmodule = ret[2];
        _ftype = ret[4];

        dependencies.push(_fmodule + '.' + _ftype);
    }

    if (fileType === 'jsp' || fileType === 'html') {
        // handle amd js file.
        fileContent.replace(requireExpr, function(match, deps) {
            deps = eval(deps);
            for (var i = 0; i < deps.length; i++) {
                deps[i] += '.js';
            }

            dependencies = dependencies.concat(deps);
        });
    }

    return dependencies;
};

/**
 * recursive depends
 * @param  {String} basepath 'all js files base path.'
 * @param  {String} identifier 'app/module' or 'app/module.js'
 * @param  {Boolean} nocache
 * @return {Array} 'recursive depends also include itself.'
 */
exports.findNested = function(basepath, identifier, nocache) {
    var dependsTree, dependsArray;
    var nestedDepends = null;
    identifier = identifier.replace(/\.js$/i, '');

    function getRecursiveDepends(arr) {
        for (var i = 0, j; j = arr[i]; i++) {
            if (nestedDepends.indexOf(j) === -1) {
                nestedDepends.push(j);

                if (dependsTree[j]) {
                    getRecursiveDepends(dependsTree[j]);
                }
            }
        }
    }

    if (!nestedDepends || nocache) {
        nestedDepends = [];
        dependsTree = exports.tree(basepath, nocache);

        dependsArray = dependsTree[identifier];
        getRecursiveDepends(dependsArray);
    }


    return nestedDepends.filter(function (ele, index, array) {
        // rm duplicated element in this array.
        return array.indexOf(ele) === index;
    });
};