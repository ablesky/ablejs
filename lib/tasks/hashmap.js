/**
 * A grunt task that replace file content by CRC32 hashes.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var fs = require('fs');
    var path = require('path');

    var MAP_PATH = 'dist/hashmap.json';
    var hashMap = grunt.file.readJSON(MAP_PATH);

    var rmultilineCommentsExpr = /\/\*(?!\!)([\s\S]*?)\*\//g;

    var CSS_PLACEHOLDER = '%IMG_PATH%';
    var CSS_PREFIX_PATH = 'http://www.ablesky-a.com:8080/ableskystatics/images/';

    /**
     * CSS_PLACEHOLDER <--> CSS_PREFIX_PATH
     */
    function replacePicPrefixInCSS(content, isReversed) {
        return content.replace(new RegExp(isReversed ? CSS_PLACEHOLDER : CSS_PREFIX_PATH, 'g'), isReversed ? CSS_PREFIX_PATH : CSS_PLACEHOLDER);
    }

    // show hash map.
    // console.log(hashMap);

    grunt.registerMultiTask('hashmap', 'replace static paths in files by hashmap', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var target = this.target;

        done.index = 0;

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

                    console.log(('hashmaping: ' + filepath).cyan);

                    // Using the regular expression literal, because the RegExp object pattern(new RegExp()) can't match, i don't know why!
                    // \w == [a-zA-Z0-9_]
                    var rpathExpr = /\/?((([-\.\w]+\/)*[-\.\w]+)\.(js|css|png|jpe?g|gif|ico)\b)/g;
                    var ret = [];
                    var _ftype, _fname, _fmodule, _rhash;
                    var wdata = data;

                    // replace images path prefix.
                    if (target === 'css') {
                        wdata = replacePicPrefixInCSS(wdata.replace(rmultilineCommentsExpr, ''), false);
                    }

                    while ((ret = rpathExpr.exec(wdata)) != null) {
                        _fname = ret[1];
                        _fmodule = ret[2];
                        _ftype = ret[4];
                        _rhash = hashMap[_ftype][_fmodule];

                        if (_rhash) {
                            rpathExpr.lastIndex += _rhash.length + 1;
                            wdata = wdata.replace(new RegExp(_fname), _fmodule + '-' + _rhash + '.' + _ftype);
                        } else {
                            console.log(_rhash === undefined ? 'undefined'.red : _rhash, 'matched regexp: ' + ret[0].cyan);
                        }
                    }

                    // recovery previous replace.
                    if (target === 'css') {
                        wdata = replacePicPrefixInCSS(wdata, true);
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