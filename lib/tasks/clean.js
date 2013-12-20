/**
 * A grunt task that for clean files and folders.
 */

module.exports = function(grunt) {
    'use strict';

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');

    grunt.registerMultiTask('clean', 'A grunt task that for clean files and folders.', function() {
        var options = this.options();
        // blocking deletion of folders outside current working dir.
        var force = options.force === true;
        var cwd = process.cwd();

        // clean files & directory.
        this.filesSrc.forEach(function(filepath) {
            if (!file.exists(filepath)) {
                return false;
            }

            log.write('Cleaning ' + (filepath + '...').info);

            if (!force) {
                if (filepath.indexOf(cwd) === -1) {
                    log.error('Can\'t delete files outside the cwd: ' + cwd);
                }
            }

            try {
                file.delete(filepath);
            } catch (e) {
                log.error('Unable to delete "' + filepath + '" file (' + e.message + ').');
            }

            log.info('ok');
        });
    });

};