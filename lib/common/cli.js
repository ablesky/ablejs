/**
 * cli - command-line interface for ablejs.
 */

'use strict';

// node libs.
var path = require('path');

// internal libs.
var log = require('../utils/log');
var argv = require('../utils/argv');
var filemap = require('../common/filemap');

var ret;
argv.add('filemap-fingerprint', [String, null]);
argv.add('filemap-path', [String, null]);

var fmp = argv.get('filemap-path');
var fmf = argv.get('filemap-fingerprint');

function println(output) {
    log.write(JSON.stringify(output));
}

if (fmp) {
    ret = fmp === 'true' ? filemap.getAll() : (filemap.get(fmp) || {});
    
    return println(ret);
}

if (fmf) {
    ret = {
        list: fmf === 'true' ? [] : filemap.getByFingerprint(fmf)
    };

    return println(ret);
}