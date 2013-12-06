/**
 * utils - argv.
 */

'use strict';

// external libs.
var nopt = require('nopt');

var argvs = {};
var knownOpts = {
    'color': Boolean,
    'project': [String]
};

var shortHands = {
    'c' : ['--color'],
    'p' : ['--project']
};

exports.get = function(key) {
    return argvs[key];
};

exports.init = function(psargv) {
    return argvs = nopt(knownOpts, shortHands, psargv, 2);
};