/**
 * cli - command-line interface for ablejs.
 */

'use strict';

// node libs.
var path = require('path');

// internal libs.
var log = require('../utils/log');
var argv = require('../utils/argv');


argv.add('filemap', [String, null]);

var fm = argv.get('filemap');

if (fm) {
    if (fm === 'true') {
        log.write(JSON.stringify(require('../common/filemap').getAll()));
    } else {
        log.write(JSON.stringify(require('../common/filemap').get(fm)));
    }
}