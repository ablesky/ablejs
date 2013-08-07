/*global module:false*/
module.exports = function(grunt) {

	'use strict';
	var buildStartTime = new Date();
	// var fs = require('fs');
	var pkg = grunt.file.readJSON('package.json');

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: pkg,
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		copy: {
			options: {
				banner: '<%= banner %>',
				processContent: function(content, srcpath) {
					grunt.log.writeln('copying non-js file to ' + pkg.config.dest + '/: "' + srcpath + '"');
				}
			},
			target: {
				// Flattening the filepath output
				flatten: true,
				// Enable dynamic expansion.
				expand: true,
				// Src matches are relative to this path.
				cwd: '<%= pkg.config.src %>/',
				// match all files except for *.js 
				src: ['**/*', '!**/*.js'],
				// Destination path prefix.
				dest: '<%= pkg.config.dest %>/',
				filter: 'isFile'

			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>',
				compress: {
					global_defs: {
						"DEBUG": false
					},
					drop_debugger: true,
					dead_code: true
				}
			},
			target: {
				// Enable dynamic expansion.
				expand: true,
				// Src matches are relative to this path.
				cwd: '<%= pkg.config.src %>/',
				// match all files ending with .js in the ${cwd}/ subdirectory and all of its subdirectories.
				src: '**/*.js',
				// Destination path prefix.
				dest: '<%= pkg.config.dest %>/'
			}
		},
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: ['lib/<%= pkg.name %>.js'],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		jshint: {
			options: {
				evil: true,
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				globals: {
					jQuery: true,
					module: true,
					require: true,
					JSON: true,
					console: true,
					setTimeout: true
				}
			},
			gruntfile: {
				src: 'Gruntfile.js'
			}
		},
		watch: {
			options: {
				interrupt: true
			},
			default: {
				files: '<%= pkg.config.src %>/**/*.js',
				tasks: ['build']
			}
		},
		requirejs: {
			compile: {
				options: {
					allConfigurationOptionsUrl: 'https://github.com/jrburke/r.js/blob/master/build/example.build.js',
					baseUrl: '<%= pkg.config.src %>',
					dir: '<%= pkg.config.dest %>',
					useSourceUrl: false,
					optimize: 'none',
					generateSourceMaps: true,
					preserveLicenseComments: false,
					rawText: {
						jquery: ''
					},
					findNestedDependencies: true,
					modules: [{
						name: 'index/index-init',
						exclude: ['common/global']
					}],
					onBuildRead: function(moduleName, path, contents) {
						//Always return a value.
						//This is just a contrived example.
						console.log('custom build read: ' + moduleName);
						if (moduleName === 'common/global') {}
						return contents;
					}
				}
			}
		}
	});

	grunt.registerTask('logs', 'A custom task that logs stuff.', function() {
		// Force task into async mode and grab a handle to the "done" function.
		// var done = this.async();
		var buildEndTime = new Date();
		grunt.log.write('Start Time: ' + buildStartTime + '\n' + 'End Time:   ' + buildEndTime + '\n' + 'Statics build total time: ' + (buildEndTime - buildStartTime) + 'ms');
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	// Default task.
	grunt.registerTask('build', ['jshint', 'copy', 'uglify', 'logs']);
	grunt.registerTask('default', ['build', 'watch']);

};

