/**
 * A grunt task that for concat files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var path = require('path');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');

    grunt.registerMultiTask('concat', 'A grunt task that for concat files.', function() {
        var options = this.options();
        var cwd = this.data.cwd;
        var concats = this.data.files;

        Object.keys(concats).forEach(function(concatPath) {
            var dest = path.join(cwd, concatPath);

            // concat files.
            var content = concats[concatPath].map(function(filepath) {
                filepath = path.join(cwd, filepath);
                if (!file.exists(filepath)) {
                    return '';
                }

                return file.read(filepath);
            }).join('\n');

            log.info('Creating ' + dest + '...');
            // generate concated file.
            file.write(dest, content);
        });

    });
};