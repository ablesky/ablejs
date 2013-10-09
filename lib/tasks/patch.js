/**
 * A grunt task that for project patch.
 */


module.exports = function(grunt) {
    'use strict';

    // node libs.
    var path = require('path');
    var fs = require('fs');

    // internal libs.
    var log = require('../utils/log');
    var dependency = require('../utils/dependency');


    var changedFiles = {
        js: {},
        css: {},
        image: {},
        jsp: {}
    };

    var onChange = grunt.util._.debounce(function() {
        grunt.config('optiimg.files.src', Object.keys(changedFiles['image']));
        grunt.config('opticss.files.src', Object.keys(changedFiles['css']));
        grunt.config('optijs.files.src', Object.keys(changedFiles['js']));
        grunt.config('optijsp.files.src', Object.keys(changedFiles['jsp']));

        for (var i in changedFiles) {
            changedFiles[i] = Object.create(null);
        }
    }, 200);

    // on watch events configure task to only run on changed file.
    grunt.event.on('watch', function(action, filepath, target) {
        // grunt.log.writeln(target + ': ' + filepath + ' has ' + action);

        changedFiles[target][filepath] = action;
        onChange(target);
    });
    

    // task for patch.
    grunt.registerTask('patch', 'task for project patch', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();


        grunt.config(['optiimg', 'files', 'src'], changedImgs);
        grunt.task.run(['optiimg']);

        // var runs = grunt.task.run(['concat', 'requirejs', 'uglifyJS', 'minifyCSS', 'shell', 'logs']);
    });
};