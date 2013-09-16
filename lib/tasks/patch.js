/**
 * A grunt task that for project patch.
 */

module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('build', 'task for project patch', function() {
        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        var runs = grunt.task.run(['concat', 'requirejs', 'uglifyJS', 'minifyCSS', 'shell', 'logs']);

    });

};