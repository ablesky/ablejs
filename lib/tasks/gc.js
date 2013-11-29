/**
 * A grunt task that for collect unnecessary files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var exec = require('child_process').exec;
    
    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var filemap = require('../common/filemap');

    /**
     * GC class
     */
    function GC() {
        this.list = [];
    }

    GC.prototype = {
        start: function(func) {
            func.apply(this, arguments);
        },
        collect: function(path) {
            if (this.list.indexOf(path) > -1) {
                this.list.push(path);
            }
        }
    };

    // A custom task that logs unnecessary files.
    grunt.registerTask('gc', 'garbage collections for unnecessary files.', function() {

        var options = this.options();
        var gcFilePath = this.args[0]; // gc real file path in file system.
        var productEnvFilesList = file.read(gcFilePath).split('\n');
        var fingerprints = Object.keys(filemap.getFingerprintMap()); // fingerprints collections
        var gc = new GC();

        productEnvFilesList.forEach(function(path) {
            if (fingerprints.indexOf(path) === -1) {
                gc.collect(path);
            }
        });

    });

};