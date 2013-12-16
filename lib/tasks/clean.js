/**
 * A grunt task that for clean files and folders.
 */

module.exports = function(grunt) {
    'use strict';

    // external libs.
    var rimraf = require('rimraf');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');

    grunt.registerMultiTask('clean', 'A grunt task that for clean files and folders.', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            force: grunt.option('force') === true,
            'no-write': grunt.option('no-write') === true,
        });

        // Clean specified files / dirs.
        this.filesSrc.forEach(function(filepath) {
            if (!file.exists(filepath)) {
                return false;
            }

            log.info('Cleaning ' + filepath + '...');

            try {
                file.delete(filepath)
            } catch (e) {
                log.error('Unable to delete "' + filepath + '" file (' + e.message + ').');
            }
        });
    });

};