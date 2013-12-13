/**
 * module - global properties.
 */

'use strict';

// internal libs.
var profile = require('../utils/profile');

var gid = 'common/global'; // global module identifier.
var gjsp = 'includes/head-content'; // put global depends path map.
var gincludes = []; // global module includes.

var pmodules = profile.getModules();

pmodules.forEach(function(module) {
    if (module.name === gid) {
        gincludes = module.includes;
    }
});

module.exports = {
    gid: gid,
    gincludes: gincludes
};