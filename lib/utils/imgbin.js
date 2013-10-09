/**
 * utils - optimize images.
 */

'use strict';

// node libs.
var path = require('path');
var fs = require('fs');
var execFile = require('child_process').execFile;

// external libs.
// https://github.com/yeoman/node-optipng-bin
// https://github.com/yeoman/node-jpegtran-bin
var pngOptiPath = require('optipng-bin').path;
var jpgTranPath = require('jpegtran-bin').path;

// internal libs.
var file = require('./file');
var log = require('./log');

/**
 * imgbin api.
 */
exports.optimize = function(sourceFile, resultFile, callback) {

    var fileType = path.extname(sourceFile).replace(/^\./, '').toLowerCase();
    var resultDir = path.dirname(resultFile);
    var binPath, options = [];

    if (fs.existsSync(resultFile)) {
        log.info('exist optimized image file.\n');
        
        callback();
    } else {
        if (!fs.existsSync(resultDir)) {
            file.mkdir(resultDir);
        }

        switch (fileType) {
            case 'gif':
            case 'png':
                binPath = pngOptiPath;
                options = ['-force', '-strip', 'all', '-o', 2, '-out', resultFile, sourceFile];
                break;
            case 'jpg':
            case 'jpeg':
                binPath = jpgTranPath;
                options = ['-copy', 'none', '-optimize', '-outfile', resultFile, sourceFile];
                break;
            default:
                log.warn('unknown file type: "' + fileType + '".' + '\n');

                return callback();
        }

        execFile(binPath, options, function(err, stdout, stderr) {
            var sourceSize, resultSize;

            if (err) {
                file.copy(sourceFile, resultFile);

                log.info('just copy source file: "' + sourceFile + '".' + '\n');
            } else {
                sourceSize = fs.statSync(sourceFile).size;
                resultSize = fs.statSync(resultFile).size;

                log.info('source size: ' + (sourceSize / 1000 + 'kb').cyan +
                    '. result size: ' + (resultSize / 1000 + 'kb').cyan + '.  saving: ' + ((sourceSize - resultSize) / 1000 + 'kb').cyan + '\n');
            }

            callback();
        });
    }
};