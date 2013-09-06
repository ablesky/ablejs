
/**
 * A grunt task that replace file content by CRC32 hashes.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var fs = require('fs');
    var path = require('path');

    var mapfile = 'dist/hashmap.json';
    var hashmap = grunt.file.readJSON(mapfile);

    grunt.registerMultiTask('hashmap', 'replace files static paths by hashMap', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        done.index = 0;

        console.log(hashmap);

        this.files.forEach(function(element, i, array) {
            var basedir = element.cwd;
            var sources = element.src;

            sources.forEach(function(relpath, i, array) {
                var filepath = path.join(basedir, relpath);

                if (!fs.existsSync(filepath)) {
                    return grunt.log.warn('Source file "' + filepath + '" not found.');
                }

                fs.readFile(filepath, 'utf8', function(err, data) {
                    if (err) {
                        throw err;
                    }

                    console.log(('opertating file: ' + filepath).cyan);

                    // Using the regular expression literal, because the RegExp object pattern(new RegExp()) can't match, i don't know why!
                    var rpathExpr = /\/?((([-_A-z0-9]+\/)*[-_\w]+)\.(js|css|png|jpe?g|gif|ico)\b)/g;
                    var ret = [];
                    var _ftype, _fname, _fmodule, _rhash;
                    var wdata = data;

                    while ((ret = rpathExpr.exec(wdata)) != null) {
                        _fname = ret[1];
                        _fmodule = ret[2];
                        _ftype = ret[4];
                        _rhash = hashmap[_ftype][_fmodule];

                        console.log(_rhash, 'match RegExp: ' + ret[0].cyan);

                        if (_rhash) {
                            wdata = wdata.replace(new RegExp(_fname, 'g'), _fmodule + '-' + _rhash + '.' + _ftype);
                        }
                    }

                    if (wdata !== data) {
                        fs.writeFileSync(filepath, wdata, 'utf8');
                    }

                    if (done.index === (sources.length - 1)) {
                        done();
                    } else {
                        done.index++;
                    }
                });

            });

        });


    });
};