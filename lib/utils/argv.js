/**
 * utils - argv.
 */

'use strict';

// external libs.
var nopt = require('nopt');

var initp;
var argvs = {};
var knownOpts = {
    'colors': [String, null],
    'project': [String],
    'debug': [Boolean],
    'cli': [Boolean]
};

var shortHands = {
    'c': ['--colors'],
    'p': ['--project']
};

function generate() {
    var parsed = nopt(knownOpts, shortHands, initp, 2);
    Object.keys(parsed).map(function(ele, index, array) {
        argvs[ele] = parsed[ele];
    });
}

exports.add = function(key, type) {
    knownOpts[key] = type;
    generate();

    return argvs;
};

exports.get = function(key) {
    return argvs[key];
};

exports.init = function(psargv) {
    initp = psargv;
    generate();
    return argvs;
};