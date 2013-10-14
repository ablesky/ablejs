/*global module:false*/
module.exports = function(grunt) {

    'use strict';

    // internal libs.
    var profileUtil = require('./lib/common/profile');

    var startTime = new Date();
    var pkg = grunt.file.readJSON('package.json');

    function getSourceRootDirname(path) {
        return path.split('/').pop();
    }

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: pkg,
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> support@ablesky.com;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        clean: {
            options: {
                // overrides this task from blocking deletion of folders outside current working dir (CWD)
                force: true
            },
            image: {
                src: ['<%= pkg.config.dest_img %>']
            },
            css: {
                src: ['<%= pkg.config.dest_css %>']
            },
            js: {
                src: ['<%= pkg.config.dest_js %>']
            },
            jsp: {
                src: ['<%= pkg.config.dest_jsp %>']
            }
        },
        jshint: {
            options: {
                // http://www.jshint.com/docs/options/
                jshintrc: '.jshintrc'
            },
            ablejs: {
                src: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
            },
            develop: {
                src: ['<%= pkg.config.src_js %>**/*.js']
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>'
            },
            css: {
                files: profileUtil.getConcatFiles('css', pkg.config.src_css)
            },
            js: {
                files: profileUtil.getConcatFiles('js', pkg.config.src_js)
            }
        },
        optiimg: {
            files: {
                // Src matches are relative to this path.
                cwd: '<%= pkg.config.src_img %>',
                // match all files in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['**/*', '!**/*.psd'],
                // Destination path prefix.
                dest: '<%= pkg.config.dest_img %>',
                filter: 'isFile'
            }
        },
        opticss: {
            options: {
                banner: '<%= banner %>'
            },
            files: {
                // Src matches are relative to this path.
                cwd: '<%= pkg.config.src_css %>',
                // match all files ending with .css in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['**/*.css', '!api/ablesky.api.login.css'],
                // Destination path prefix.
                dest: '<%= pkg.config.dest_css %>'
            }
        },
        optijs: {
            options: {
                banner: '<%= banner %>'
            },
            files: {
                // Src matches are relative to this path.
                cwd: '<%= pkg.config.src_js %>',
                // match all files ending with .js in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['**/*.js', '!tinymce/**/*.js'],
                // Destination path prefix.
                dest: '<%= pkg.config.dest_js %>'
            }
        },
        optijsp: {
            files: {
                // Src matches are relative to this path.
                cwd: '<%= pkg.config.src_jsp %>',
                // match all files ending with .js in the ${cwd}/ subdirectory and all of its subdirectories.
                src: ['**/*.jsp'],
                // Destination path prefix.
                dest: '<%= pkg.config.dest_jsp %>'
            }
        },
        replace: {
            jsp: {
                // Src matches are relative to this path.
                cwd: '<%= pkg.config.dest_jsp %>',
                src: ['**/*.jsp'],
                // toreplace can be regexp | str
                toreplace: /<%=staticsServer%>images/g,
                newstring: '<%=imgPath%>'
            }
        },
        shell: {
            echo: {
                command: 'echo Good Job!'
            }
        },
        chrono: {
            options: {
                start: startTime
            }
        },
        patch: {
            options: {
                jshint: false,
                root: {
                    img: getSourceRootDirname(pkg.config.src_img),
                    css: getSourceRootDirname(pkg.config.src_css),
                    js: getSourceRootDirname(pkg.config.src_js),
                    jsp: getSourceRootDirname(pkg.config.src_jsp)
                }
            }
        }
    });

    // load custom tasks. 
    grunt.loadTasks('lib/tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('build', ['clean', 'concat', 'optiimg', 'opticss', 'optijs', 'optijsp', 'shell', 'chrono']);
    grunt.registerTask('default', ['build']);

};