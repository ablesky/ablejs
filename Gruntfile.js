/*global module:false*/
module.exports = function(grunt) {

	'use strict';
	var buildStartTime = new Date();
	// var fs = require('fs');
	var pkg = grunt.file.readJSON('package.json');

	function getRequireJSProfile() {
		// Force task into async mode and grab a handle to the "done" function.
		// var done = this.async();
		var profile = grunt.file.readJSON('dist/profile.json'); // profile for requirejs task, include modules
		var _modules = profile.modules; 	// app modules
		var _excludes = profile.excludes; 	// excludes common modules
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

		console.log(_targetModules);
		return _targetModules;
	}

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
				cwd: '<%= pkg.config.src %>',
				// match all files ending with .js in the ${cwd}/ subdirectory and all of its subdirectories.
				src: '**/*.js',
				// Destination path prefix.
				dest: '<%= pkg.config.dest %>'
			}
		},
		transport: {
			options: {

			},
			dist: {
				files: [{
					cwd: '<%= pkg.config.src %>',
					src: '**/*.js',
					dest: '<%= pkg.config.dest %>'
				}]
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
				interrupt: true,
				interval: 5007 // 5007 is the old node polling default
			},
			build: {
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
					modules: getRequireJSProfile(),
					onBuildRead: function(moduleName, path, contents) {
						console.log('reading: ' + path);

						// Always return a value.
						return contents;
					},
					onBuildWrite: function(moduleName, path, contents) {
						console.log('writing: ' + path);
						if (moduleName === 'common/global') {}

						// Always return a value.
						// return contents.replace(/^define\(['|"]common\/global['|"],\s*[\w|\W]*\);$/ig, '');
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
	grunt.loadNpmTasks('grunt-cmd-transport');
	grunt.loadNpmTasks('grunt-cmd-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task.
	grunt.registerTask('build', ['jshint', 'transport', 'concat', 'copy', 'uglify', 'logs']);
	grunt.registerTask('default', ['build', 'watch']);
	// grunt.registerTask('default', ['requirejs-profile']);

};