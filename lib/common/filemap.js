/**
 * utils - A tool for operate filemap.
 */

'use strict';

// node libs.
var path = require('path');

// internal libs.
var file = require('../utils/file');
var fingerprint = require('../utils/fingerprint');
var dependency = require('../utils/dependency');

var MAP_PATH = 'conf/filemap.json';
var MAP_BACKUP_PATH = 'conf/backup.json';

var filemap;
try {
    filemap = file.readJSON(MAP_PATH);
} catch (e) {
    filemap = {};
}

function getExtname(p) {
    return path.extname(p).replace(/^\./, '').toLowerCase();
}

function needFindDepends(identifier) {
    var fileType = getExtname(identifier);
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

function sortDepends(deps, index) {
    // sort element, in case of replace error.
    // e.g: 
    // a: app/module1.js
    // b: container/app/module1.js
    // if replace 'a', it may be replace 'b'. so sort 'b' comes first.
    var interchangeIndex;
    var tmp;
    index = index || 0;

    for (var i = index, item; item = deps[i]; i++) {
        interchangeIndex = -1;
        for (var j = i + 1; j < deps.length; j++) {
            if (deps[j].indexOf(item) > -1) {
                interchangeIndex = j;
                break;
            }
        }

        if (interchangeIndex > -1) {
            tmp = deps[i];
            deps[i] = deps[interchangeIndex];
            deps[interchangeIndex] = tmp;


            sortDepends(deps, index);
            break;
        }
    }
    return deps;
}


/**
 * backup origin filemap.
 * @return {Object} "the origin filemap object."
 */
function backup(identifier, obj) {
    file.write(MAP_PATH, JSON.stringify(exports.getAll()));
}

/**
 * @example set(identifier, obj)
 * @return {Object}
 */
function set(identifier, obj) {
    backup(identifier, filemap[identifier]);

    return filemap[identifier] = obj;
}

/**
 * @example filemap.get(identifier)
 */
exports.get = function(identifier) {
    return filemap[identifier];
};

/**
 * @example filemap.getByFingerprint(hash)
 */
exports.getByFingerprint = function(hash) {
    var list = [];

    for (var identifier in filemap) {
        if (hash === filemap[identifier].fingerprint) {
            list.push({
                identifier: identifier,
                dependencies: filemap[identifier].dependencies
            });
        }
    }

    return list;
};

/**
 * @example filemap.getAll()
 */
exports.getAll = function() {
    return filemap;
};

/**
 * @example filemap.updateMap('app/module.js', TheIdentifierContent)
 * @param {String} identifier
 * @param {String} content
 */
exports.updateMap = function(identifier, content) {
    var filetype = getExtname(identifier);
    var dependencies = needFindDepends(identifier) ? dependency.find(filetype, content) : [];

    return set(identifier, {
        fingerprint: fingerprint.generate(content),
        dependencies: dependencies.filter(function(element, index) {
            // remove duplicate values in deps.
            return dependencies.lastIndexOf(element) === index;
        })
    });
};

exports.addAmdDepends = function(identifier, deps) {
    if (Array.isArray(deps)) {
        deps = deps.map(function(element) {
            return (/\.js$/).test(element) ? element : element + '.js';
        });
        exports.get(identifier).dependencies = exports.get(identifier).dependencies.concat(deps);
    }

    return exports.get(identifier);
};

/**
 * @example filemap.getFingerprintMap()
 * @return {Object} 'a object that key is fingerprint, e.g "6acfe18d.js" maybe a key in the object.'
 */
exports.getFingerprintMap = function() {
    var map = {};

    for (var identifier in filemap) {
        map[filemap[identifier].fingerprint + '.' + getExtname(identifier)] = {
            identifier: identifier,
            dependencies: filemap[identifier].dependencies
        };
    }

    return map;
};

/**
 * @description process dependencies.
 * @param {String} wdata    "the file content."
 * @param {Array} wdepends  "the file dependencies."
 * @param {Array} wtype     "the file type."
 */
exports.processDepends = function(wdata, wdepends) {

    sortDepends(wdepends).forEach(function(element) {
        if (filemap[element]) {
            wdata = wdata.replace(new RegExp(element + '\\b', 'g'), filemap[element].fingerprint + path.extname(element));
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

    for (var i in filemap) {
        if (filemap[i].dependencies.indexOf(identifier) > -1) {
            dependencies.push(i);
        }
    }

    return dependencies;
};

/**
 * @example filemap.clear()
 */
exports.clear = function() {
    filemap = {};
    exports.save();
};

/**
 * @example filemap.save()
 */
exports.save = function() {

    file.write(MAP_PATH, JSON.stringify(exports.getAll()));
};