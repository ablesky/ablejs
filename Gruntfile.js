/*global module:false*/
module.exports = function(grunt) {

    'use strict';

    // node libs.
    var path = require('path');

    // internal libs.
    var profileUtil = require('./lib/utils/profile');
    var log = require('./lib/utils/log');
    var file = require('./lib/utils/file');
    var mimes = require('./lib/common/mimes');

    var pkg = file.readJSON('package.json');

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: pkg,
        mimes: mimes,
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> frontend@ablesky.com;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        clean: {
            options: {
                // overrides this task from blocking deletion of folders outside current working dir (CWD)
                force: true
            },
            image: {
                src: ['<%= mimes.image.dest_path %>']
            },
            css: {
                src: ['<%= mimes.css.dest_path %>']
            },
            js: {
                src: ['<%= mimes.js.dest_path %>']
            },
            jsp: {
                src: ['<%= mimes.tmpl.dest_path %>']
            }
        },
        jshint: {
            ablejs: {
                options: {
                    // http://www.jshint.com/docs/options/
                    jshintrc: '.jshintrc'
                },
                src: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
            },
            develop: {
                options: {
                    // http://www.jshint.com/docs/options/
                    jshintrc: path.join(mimes.js.src_path, '.jshintrc')
                },
                base: 'dist/jshint/',
                src: ['<%= jshint.develop.base %>**/*.js']
            }
        },
        copy: {
            css: {
                // Src matches are relative to this path.
                cwd: '<%= mimes.css.src_path %>',
                // match all files ending with .css in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['api/ablesky.api.login.css'],
                // Destination path prefix.
                dest: '<%= mimes.css.dest_path %>',
                filter: 'isFile'
            },
            js: {
                // Src matches are relative to this path.
                cwd: '<%= mimes.js.src_path %>',
                // match all match files in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['api/ablesky.api.login.js', 'tinymce/**'],
                // Destination path prefix.
                dest: '<%= mimes.js.dest_path %>',
                filter: 'isFile'
            }
        },
        concat: {
            options: {
                banner: '' // do not add <%= banner %> in concat task.
            },
            css: {
                // Src matches are relative to this path.
                cwd: '<%= mimes.css.src_path %>',
                files: profileUtil.getConcats('css')
            },
            js: {
                // Src matches are relative to this path.
                cwd: '<%= mimes.js.src_path %>',
                files: profileUtil.getConcats('js')
            }
        },
        optiimg: {
            files: {
                // Src matches are relative to this path.
                cwd: '<%= mimes.image.src_path %>',
                // match all files in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['**/*', '!**/*.psd'],
                // Destination path prefix.
                dest: '<%= mimes.image.dest_path %>',
                filter: 'isFile'
            }
        },
        opticss: {
            options: {
                banner: '<%= banner %>'
            },
            files: {
                // Src matches are relative to this path.
                cwd: '<%= mimes.css.src_path %>',
                // match all files ending with .css in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['**/*.css', '!api/ablesky.api.login.css'],
                // Destination path prefix.
                dest: '<%= mimes.css.dest_path %>'
            }
        },
        optijs: {
            options: {
                banner: '<%= banner %>'
            },
            files: {
                // Src matches are relative to this path.
                cwd: '<%= mimes.js.src_path %>',
                // match all files ending with .js in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['**/*.js', '**/*.swf', '!tinymce/**/*.js'],
                // Destination path prefix.
                dest: '<%= mimes.js.dest_path %>'
            }
        },
        optijsp: {
            options: {
                jsBasePath: '<%= mimes.js.src_path %>',
            },
            files: {
                // Src matches are relative to this path.
                cwd: '<%= mimes.tmpl.src_path %>',
                // match all files ending with .js in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['**/*.jsp'],
                // Destination path prefix.
                dest: '<%= mimes.tmpl.dest_path %>'
            }
        },
        replace: {
            jsp: {
                // Src matches are relative to this path.
                cwd: '<%= mimes.tmpl.dest_path %>',
                src: ['**/*.jsp'],
                // toreplace can be regexp | str
                toreplace: /<%=staticsServer%>images/g,
                newstring: '<%=imgPath%>'
            }
        },
        chrono: {
            options: {
                start: new Date()
            }
        },
        patch: {
            options: {
                // the flag can turn on/off the jshint task at patch task.
                jshint: false,
                // the path to run jshint task
                jshintpath: '<%= jshint.develop.base %>',
                root: {
                    img: mimes.image.src_dir,
                    css: mimes.css.src_dir,
                    js: mimes.js.src_dir,
                    jsp: mimes.tmpl.src_dir
                }
            }
        }
    });

    // load custom tasks. 
    grunt.loadTasks('lib/tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task.
    grunt.registerTask('build', ['clean', 'concat', 'copy', 'optiimg', 'opticss', 'optijs', 'optijsp', 'chrono']);
    grunt.registerTask('default', 'A tip for show help.', function() {
        log.writeln('Try `ablejs -h` or `ablejs --help` for more information.'.help);
    });

};