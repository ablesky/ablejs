/**
 * memes - prvide context config for ablejs.
 */

'use strict';

// node libs.
var path = require('path');

// internal libs.
var log = require('../utils/log');
var argv = require('../utils/argv');


var contextPath = argv.get('context-path');
// pass argv context, to specify which context you want to build.
if (!contextPath) {
    log.error('context-path value is: ' + contextPath + ', please specify context argv!');
}

var OPT_SUFFIX = '_optimize';
var SRC_IMG_DIR = 'images',
    SRC_CSS_DIR = 'css',
    SRC_JS_DIR = 'js',
    SRC_TMPL_DIR = 'jsp';

var OPT_IMG_DIR = SRC_IMG_DIR + OPT_SUFFIX,
    OPT_CSS_DIR = SRC_CSS_DIR + OPT_SUFFIX,
    OPT_JS_DIR = SRC_JS_DIR + OPT_SUFFIX,
    OPT_TMPL_DIR = SRC_TMPL_DIR + OPT_SUFFIX;


module.exports = {
    'image': {
        src_dir: SRC_IMG_DIR,
        dest_dir: OPT_IMG_DIR,
        src_path: path.join(contextPath, SRC_IMG_DIR),
        dest_path: path.join(contextPath, OPT_IMG_DIR)
    },
    'css': {
        src_dir: SRC_CSS_DIR,
        dest_dir: OPT_CSS_DIR,
        src_path: path.join(contextPath, SRC_CSS_DIR),
        dest_path: path.join(contextPath, OPT_CSS_DIR)
    },
    'js': {
        src_dir: SRC_JS_DIR,
        dest_dir: OPT_JS_DIR,
        src_path: path.join(contextPath, SRC_JS_DIR),
        dest_path: path.join(contextPath, OPT_JS_DIR)
    },
    'tmpl': {
        src_dir: SRC_TMPL_DIR,
        dest_dir: OPT_TMPL_DIR,
        src_path: path.join(contextPath, SRC_TMPL_DIR),
        dest_path: path.join(contextPath, OPT_TMPL_DIR)
    }
};

console.log(module.exports)