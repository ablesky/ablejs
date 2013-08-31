/*global module:false*/
module.exports = function(grunt) {

	'use strict';

	// var fs = require('fs');
	var buildStartTime = new Date();
	var path = require('path');
	var pkg = grunt.file.readJSON('package.json');
	var profile = grunt.file.readJSON(path.join(pkg.config.src_js, 'profile.json')); // A profile for build content.
	function getConcatFiles(fileType) {
		var files = (fileType === 'js' ? profile.concatJS: profile.concatCSS) || {};
		var srcPath = fileType === 'js' ? pkg.config.src_js: pkg.config.src_css;
		var destPath = fileType === 'js' ? pkg.config.dest_js: pkg.config.dest_css;
		var _ = Object.create(Object.prototype);

		Object.keys(files).forEach(function(ele, i, array) {
			_[path.join(destPath, ele)] = files[ele].map(function(filename) {
				return path.join(srcPath, filename);
			});
		});

		return _;
	}

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: pkg,
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		clean: {
			options: {
				force: true
			},
			dist: {
				src: ['<%= pkg.config.dest_js %>', '<%= pkg.config.dest_css %>']
			}
		},
		crc32: {
			files: {
				src: ['<%= pkg.config.dest_img %>/**/*'],
				filter: 'isFile'
			}
		},
		optiIMG: {
			files: {
				// Src matches are relative to this path.
				cwd: '<%= pkg.config.src_img %>',
				// match all files in the ${cwd}/ subdirectory and all of its subdirectories.
				src: ['**/*'],
				// Destination path prefix.
				dest: '<%= pkg.config.dest_img %>',
				filter: 'isFile'
			}
		},
		concat: {
			options: {
				banner: '<%= banner %>'
			},
			css: {
				files: getConcatFiles('css')
			},
			js: {
				files: getConcatFiles('js')
			}
		},
		jshint: {
			options: {
				// http://www.jshint.com/docs/options/
				jshintrc: '.jshintrc'
			},
			gruntfile: {
				expand: true,
				src: ['Gruntfile.js', '!<%= pkg.config.src_js %>/**/*.js']
			}
		},
		uglifyJS: {
			options: {
				banner: '<%= banner %>'
			},
			files: {
				// Enable dynamic expansion.
				expand: true,
				// Src matches are relative to this path.
				cwd: '<%= pkg.config.dest_js %>',
				// match all files ending with .js in the ${cwd}/ subdirectory and all of its subdirectories.
				src: '**/*.js',
				// Destination path prefix.
				dest: '<%= pkg.config.dest_js %>'
			}
		},
		minifyCSS: {
			options: {
				banner: '<%= banner %>'
			},
			files: {
				// Enable dynamic expansion.
				expand: true,
				// Src matches are relative to this path.
				cwd: '<%= pkg.config.src_css %>',
				// match all files ending with .css in the ${cwd}/ subdirectory and all of its subdirectories.
				src: '**/*.css',
				// Destination path prefix.
				dest: '<%= pkg.config.dest_css %>'
			}
		},
		requirejs: {
			compile: {
				options: {
					allConfigurationOptionsUrl: 'https://github.com/jrburke/r.js/blob/master/build/example.build.js',
					baseUrl: '<%= pkg.config.src_js %>',
					dir: '<%= pkg.config.dest_js %>',
					paths: {
						'jquery': 'empty:'
					},
					useStrict: true,
					useSourceUrl: false,
					optimize: 'none',
					generateSourceMaps: false,
					preserveLicenseComments: false,
					keepBuildDir: true,
					skipDirOptimize: true,
					optimizeAllPluginResources: false,
					findNestedDependencies: true,
					modules: profile.modules,
					onBuildRead: function(moduleName, path, contents) {
						console.log('reading: ' + path);

						return contents;
					}
				}
			}
		},
		shell: {
			target: {
				command: 'echo Good Job!'
			}
		},
		watch: {
			options: {
				interrupt: true
				// ,
				// interval: 5007 // 5007 is the old node polling default
			},
			images: {
				files: ['<%= pkg.config.src_img %>/**/*'],
				tasks: ['watchingImg']
			},
			src: {
				files: '<%= pkg.config.src_js %>/**/*.js',
				tasks: ['patch']
			}
		}
	});

	var changedImgs = [];
	// on watch events configure task to only run on changed file.
	grunt.event.on('watch', function(action, filepath) {
		console.log(filepath);
		changedImgs.push(filepath)
	});

	grunt.registerTask('watchingImg', '', function() {
		grunt.config(['optiIMG', 'files', 'src'], changedImgs);
		grunt.task.run(['optiIMG']);
	});

	grunt.registerTask('logs', 'A custom task that logs stuff.', function() {
		var buildEndTime = new Date();

		grunt.log.writeln('Start Time: ' + buildStartTime);
		grunt.log.writeln('End Time:   ' + buildEndTime);
		grunt.log.writeln('Statics build total time: ' + (buildEndTime - buildStartTime) / 1000 + 's');
	});

	// load custom tasks. 
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Patch task.
	grunt.registerTask('patch', ['jshint', 'concat', 'requirejs', 'uglifyJS', 'minifyCSS', 'shell', 'logs']);
	// Build task.
	grunt.registerTask('build', ['clean', 'optiIMG', 'jshint', 'concat', 'requirejs', 'uglifyJS', 'minifyCSS', 'shell', 'logs']);
	// Default task.
	grunt.registerTask('default', ['build', 'watch']);

};

