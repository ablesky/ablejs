/**
 * utils - argv.
 */

'use strict';

// external libs.
var nopt = require('nopt');

var argvs = {};
var knownOpts = {
    "color": Boolean
};

var shortHands = {};

exports.get = function(key) {
    return argvs[key];
};

exports.init = function(psargv) {
    argvs = nopt(knownOpts, shortHands, psargv, 2);
};