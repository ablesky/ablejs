/**
 * A grunt task that run shell.
 */

module.exports = function(grunt) {
	'use strict';

	// node libs.
	var exec = require('child_process').exec;
	var fs = require('fs');

	function fatal(msg) {
		grunt.fatal(msg);
		done();
	}

	grunt.registerMultiTask('shell', 'run shell command', function() {
		// Force task into async mode and grab a handle to the "done" function.
		var done = this.async();

		var options = this.options();
		var command = this.data.command;

		if (!command) {
			grunt.fatal('please config target key "command"!');
		} else {
			try {
				exec(command, options, function(error, stdout, stderr) {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
						fatal('exec error: ' + error);
					} else {
						done();
					}
				});
			} catch(e) {
				fatal(e);
			}

		}

	});

};

