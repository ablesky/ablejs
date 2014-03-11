/**
 * utils - argv.
 */

'use strict';

// external libs.
var nopt = require('nopt');

var argvs = {};
var knownOpts = {
    'colors': [String, null],
    'context-path': [String],
    'project': [String],
    'debug': [Boolean],
    'cli': [Boolean]
};

var shortHands = {
    // 'c': ['--colors'],
    // 'p': ['--project']
};

function generate() {
    var parsed = nopt(knownOpts, shortHands, process.argv, 2);
    Object.keys(parsed).map(function(ele, index, array) {
        argvs[ele] = parsed[ele];
    });
}

generate();

exports.add = function(key, type) {
    knownOpts[key] = type;
    generate();

    return argvs;
};

exports.get = function(key) {
    return argvs[key];
};