/**
 * A grunt task that run shell.
 */

module.exports = function(grunt) {
	'use strict';

	// node libs.
	var exec = require('child_process').exec;

	function fatal(msg) {
		grunt.fatal(msg);
	}

	grunt.registerMultiTask('shell', 'run shell command', function() {
		// Force task into async mode and grab a handle to the "done" function.
		var done = this.async();

		var options = this.options();
		var command = this.data.command;

		if (!command) {
			fatal('please config target key "command"!');
		} else {
			try {
				exec(command, options, function(error, stdout, stderr) {
					log.writeln('stdout: ' + stdout);
					log.writeln('stderr: ' + stderr);
					if (error !== null) {
						fatal('exec error: ' + error);
					}

					done();
				});
			} catch(e) {
				fatal(e);
			}

		}

	});

};

