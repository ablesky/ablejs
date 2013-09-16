/**
 * A grunt task that build project.
 */

module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('build', 'task for build project', function() {
        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        var runs = grunt.task.run(['concat', 'requirejs', 'uglifyJS', 'minifyCSS', 'shell', 'logs']);

    });

};