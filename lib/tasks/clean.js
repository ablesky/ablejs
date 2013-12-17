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
        var options = this.options();

        // clean files & directory.
        this.filesSrc.forEach(function(filepath) {
            if (!file.exists(filepath)) {
                return false;
            }

            log.write('Cleaning ' + (filepath + '...').info);

            try {
                file.delete(filepath)
            } catch (e) {
                log.error('Unable to delete "' + filepath + '" file (' + e.message + ').');
            }

            log.info('ok');
        });
    });

};