/**
 * A grunt task that for collect unnecessary files.
 */

module.exports = function(grunt) {
    'use strict';

    // internal libs.
    var log = require('../utils/log');
    var filemap = require('../common/filemap');

    // A custom task that logs stuff.
    grunt.registerTask('gc', 'garbage collections for unnecessary files.', function() {

        var options = this.options();
        var filemap = filemap.getAll();

        var garbageCollections = [];

        /**
         * @example gc.collect(path)
         */
        function collect(path) {
            if (garbageCollections.indexOf(path) === -1) {
                garbageCollections.push(path);
            }
        }

        /**
         * @example gc.write(path)
         */
        exports.save = function(path) {
            path
        };

    });

};