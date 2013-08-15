/*global module:false*/
module.exports = function(grunt) {

	'use strict';

	// var fs = require('fs');
	var buildStartTime = new Date();
	var pkg = grunt.file.readJSON('package.json');

	function getRequireJSProfile() {
		return grunt.file.readJSON(pkg.config.src + '/lib/profile.json');
	}

	/**
	 *	get profile for requirejs task, include modules
	 */
	function getRequireJSModules() {

		var profile = getRequireJSProfile();
		var _modules = profile.modules; // app modules
		var _excludes = profile.excludes; // excludes common modules
		var _targetModules = [];

		// push common modules
		_excludes.forEach(function(element, i, array) {
			_targetModules.push({
				name: element
			});
		});

		// push app modules
		_modules.forEach(function(element, i, array) {
			_targetModules.push({
				name: element,
				exclude: _excludes
			});
		});

		return _targetModules;
	}

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: pkg,
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		// http://www.jshint.com/docs/options/
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
				unused: 'vars',
				boss: true,
				eqnull: true,
				smarttabs: true,
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
				expand: true,
				src: ['Gruntfile.js', '!<%= pkg.config.src %>/**/*.js']
			}
		},
		concat: {
			options: {
				banner: '<%= banner %>'
			},
			jquery_plugins: {
				expand: true,
				src: ['<%= pkg.config.src %>/lib/jquery/jquery-*.js'],
				dest: '<%= pkg.config.dest %>/lib/jquery-min.js'
			}
		},
		// copy: {
		// 	options: {
		// 		banner: '<%= banner %>',
		// 		processContent: function(content, srcpath) {
		// 			grunt.log.writeln('copying non-js file to ' + pkg.config.dest + '/: "' + srcpath + '"');
		// 		}
		// 	},
		// 	target: {
		// 		// Flattening the filepath output
		// 		flatten: true,
		// 		// Enable dynamic expansion.
		// 		expand: true,
		// 		// Src matches are relative to this path.
		// 		cwd: '<%= pkg.config.src %>/',
		// 		// match all files except for *.js 
		// 		src: ['**/*', '!**/*.js'],
		// 		// Destination path prefix.
		// 		dest: '<%= pkg.config.dest %>/',
		// 		filter: 'isFile'
		// 	}
		// },
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
			dist: {
				// Enable dynamic expansion.
				expand: true,
				// Src matches are relative to this path.
				cwd: '<%= pkg.config.dest %>',
				// match all files ending with .js in the ${cwd}/ subdirectory and all of its subdirectories.
				src: '**/*.js',
				// Destination path prefix.
				dest: '<%= pkg.config.dest %>'
			}
		},
		requirejs: {
			compile: {
				options: {
					allConfigurationOptionsUrl: 'https://github.com/jrburke/r.js/blob/master/build/example.build.js',
					baseUrl: '<%= pkg.config.src %>',
					dir: '<%= pkg.config.dest %>',
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
					modules: getRequireJSModules(),
					onBuildRead: function(moduleName, path, contents) {
						console.log('reading: ' + path);

						// Always return a value.
						return contents;
					},
					onBuildWrite: function(moduleName, path, contents) {
						console.log('writing: ' + path);

						// Always return a value.
						// return contents.replace(/^define\(['|"]common\/global['|"],\s*[\w|\W]*\);$/ig, '');
						return contents;
					}
				}
			}
		},
		watch: {
			options: {
				interrupt: true,
				interval: 5007 // 5007 is the old node polling default
			},
			src: {
				files: '<%= pkg.config.src %>/**/*.js',
				tasks: ['watching']
			}
		}
	});

	grunt.registerTask('logs', 'A custom task that logs stuff.', function() {
		// Force task into async mode and grab a handle to the "done" function.
		// var done = this.async();
		var buildEndTime = new Date();
		grunt.log.write('Start Time: ' + buildStartTime + '\n' + 'End Time:   ' + buildEndTime + '\n' + 'Statics build total time: ' + (buildEndTime - buildStartTime) / 1000 + 's');
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');


	// Watching task.
	grunt.registerTask('watching', ['jshint', 'requirejs', 'logs']); // when watching task run, it will not use uglify task. just auto uglify by expand option.
	// Build task.
	grunt.registerTask('build', ['jshint', 'requirejs', 'concat', 'uglify', 'logs']);
	// Default task.
	grunt.registerTask('default', ['build', 'watch']);

};