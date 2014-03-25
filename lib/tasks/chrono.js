/**
 * A grunt task that for time stuff.
 */

module.exports = function(grunt) {
    'use strict';

    // external libs.
    var dateformat = require('dateformat');

    // internal libs.
    var log = require('../utils/log');

    // A custom task that logs stuff.
    grunt.registerTask('chrono', 'A grunt task that for time stuff.', function() {

        var options = this.options();

        var startTime = options.start;
        var endTime = new Date();

        log.writeln('Start Time: ' + dateformat(startTime).info);
        log.writeln('End   Time: ' + dateformat(endTime).info);
        log.writeln('Build time: ' + ((endTime - startTime) / 1000 + 's').info);
    });

};