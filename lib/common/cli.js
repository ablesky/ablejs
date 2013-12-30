/**
 * cli - command-line interface for ablejs.
 */

'use strict';

// internal libs.
var log = require('../utils/log');
var argv = require('../utils/argv');
var filemap = require('../common/filemap');

var ret;
argv.add('filemap-fingerprint', [String, null]);
argv.add('filemap-path', [String, null]);

var fmp = argv.get('filemap-path');
var fmf = argv.get('filemap-fingerprint');

function response(output) {
    log.writeln(JSON.stringify(output));
}

if (fmp) {
    ret = fmp === 'true' ? filemap.getAll() : (filemap.get(fmp) || {});
    
    return response(ret);
}

if (fmf) {
    ret = {
        list: fmf === 'true' ? [] : filemap.getByFingerprint(fmf)
    };

    return response(ret);
}