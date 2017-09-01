/**
 * utils - process the file content dependency.
 */
/* jshint evil:true */

'use strict';

// node libs.
var path = require('path');

// external libs.
// https://github.com/pahen/madge
var madge = require('madge');

var file = require("./file");

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
 * @param {String} identifier 'the file identifier'
 * @param {String} fileContent 'the file content.'
 */
exports.find = function(identifier, fileContent) {

    var fileType = path.extname(identifier).replace(/^\./, '').toLowerCase();
    var dependencies = [];

    var ret = null;
    var _fname, _fmodule, _ftype;

    rpathExpr.lastIndex = 0;
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

        // for mobile webapp main file, which is entry module for page
        fileContent.replace(/data-main="(.+?)"/, function (match, dep) {
            dependencies.push('mobile/' + dep + '.js');
        });
    }

    // for mobile webapp module file
    // 可能会夹带注释里的依赖，应为源码文件可能包含注释，不过注入jsp依赖会被过滤掉
    if (fileType === 'js' && /^mobile\//.test(identifier)) {
        dependencies = dependencies.concat(getMobileModuleDeps(fileContent));
    }

    return dependencies;
};

/**
 * recursive depends
 * @param  {String} basepath 'all js files base path.'
 * @param  {String} identifier 'app/module' or 'app/module.js'
 * @param  {Boolean} nocachenode
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

        // If the module has declared id (like 'define("jquery", [], function() {return jQuery;});') 
        // in the js file, then the real module identifier in madge at this case is "jquery".
        if (dependsTree[identifier] == undefined) {
            identifier = Object.keys(madge(path.join(basepath, identifier + '.js'), {
                format: 'amd'
            }).tree)[0];
        }

        dependsArray = dependsTree[identifier];
        getRecursiveDepends(dependsArray);
    }

    // for mobile webapp
    var subDeps = [];
    if (/^mobile\//.test(identifier)) {
        for (var n = 0; n < nestedDepends.length; n++) {
            nestedDepends[n] = 'mobile/' + nestedDepends[n];
        }
        getMobileAllDepends(basepath, identifier, subDeps);
    }

    subDeps.forEach(function (elem, i) {
        elem = elem.replace(/\.js$/i, '');
        if (nestedDepends.indexOf(elem) === -1) {
            nestedDepends.push(elem);
        }
    });

    return nestedDepends.filter(function (ele, index, array) {
        // rm duplicated element in this array.
        return array.indexOf(ele) === index;
    });
};

/**
 * @method getMobileModuleDeps
 * @description match the mobile module file and return it as an array.
 * @param {String} content 'the content of someone'
 * @param {String} identifier 'the file identifier'
 */
function getMobileModuleDeps(content, identifier) {
    var deps = [];
    content.replace(/require\(["|'](.+?)["|']\)/g, function (match, dep) {
        deps.push('mobile/' + dep + '.js');
    });
    return deps;
}

/**
 * @method getMobileModuleContent
 * @description read the content of js file.
 * @param {String} basepath 'the all js file path'
 * @param {String} identifier 'the file identifier'
 */
function getMobileModuleContent(basepath, identifier) {
    var filePath = path.join(basepath, identifier),
        content = '';

    if (!/\.js$/i.test(filePath)) {
        filePath = filePath + '.js';
    }
    
    if (file.exists(filePath)) {
        content = file.read(filePath);
    } else {
        content = '';
    }

    return content;
}

/**
 * @method getMobileAllDepends
 * @description find the mobile file content dependencies.
 * @param {String} basepath 'the all js file path'
 * @param {String} identifier 'the file identifier'
 * @param {String} deps 'the dependencies array exised.'
 */
function getMobileAllDepends(basepath, identifier, deps) {
    var subDeps = [];
    subDeps = getMobileModuleDeps(getMobileModuleContent(basepath, identifier), identifier);

    subDeps.forEach(function (elem, i) {
        if (deps.indexOf(elem) === -1) {
            deps.push(elem);
            getMobileAllDepends(basepath, elem, deps);
        }
    });
}