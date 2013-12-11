/**
 * module - global properties.
 */

'use strict';

// internal libs.
var profile = require('../utils/profile');
var dependency = require('../utils/dependency');

var identifier = 'common/global';
var includes = [];

profile.getModules().forEach(function(module) {
    if (module.name === identifier) {
        includes = module.includes;
    }
});

var nestedDepends = null;
/**
 * global.js recursive depends
 * @param  {String} src   all js files root dir.
 * @param  {Boolean} nocache
 * @return {Array}       global.js recursive depends also include itself.
 */
function getGlobalJSRecursiveDepends(src, nocache) {
    var dependsTree, dependsArray;

    function getRecursiveDepends(arr) {
        for (var i = 0, j; j = arr[i]; i++) {
            if (nestedDepends.indexOf(j) === -1) {
                nestedDepends.push(j);
                getRecursiveDepends(dependsTree[j]);
            }
        }
    }

    if (!nestedDepends || nocache) {
        nestedDepends = [];
        dependsTree = dependency.tree(src);;

        dependsArray = dependsTree[identifier];
        getRecursiveDepends(dependsArray);
    }

    return nestedDepends;
}

getGlobalJSRecursiveDepends(baseUrl)

exports = {
    identifier: identifier,
    includes: includes,
    nestedDepends: getGlobalJSRecursiveDepends
};