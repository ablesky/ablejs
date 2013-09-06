var fs = require('fs');
var url = require('url');
var path = require('path');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');


/**
* file exists
* @method file.exists(filepath)
* @param path
* @returns {boolean}
*/
exports.exists = function(path) {
    try {
        fs.statSync(path);
        return true;
    } catch (e) {
        return false;
    }
};

/**
* Is the given path a file? Returns a boolean.
* @method file.isFile(filepath)
* @param filepath
* @returns {*}
*/
exports.isFile = function (filepath) {

    try{
        return fs.statSync(filepath).isFile();
    }catch(e){
        return false;
    }
};

exports.normalize = function(filepath){
    return path.join(path.dirname(filepath), exports.basename(filepath) + exports.extname(filepath));
};

exports.extname = function (filepath){
    return filepath && path.extname(url.parse(filepath).pathname);
};

exports.basename = function(filepath){
    return path.basename(filepath, path.extname(filepath));
};



/**
* Is the given path a directory? Returns a boolean.
* @method file.isDir(filepath)
* @param filepath
* @returns {*}
*/
exports.isDir = function (filepath) {

    try{
        return fs.statSync(filepath).isDirectory();
    }catch(e){
        return false;
    }

};

/**
* Delete the specified filepath. Will delete files and folders recursively.
* @method file.delete(filepath)
* @param filepath
* @returns {*}
*/
exports.delete = function(filepath){
    return rimraf.sync(filepath);
};

/**
* Synchronous rename
* @mothod file.rename(oldpath, newpath)
*/
exports.rename = function(){
    return fs.renameSync.apply(this, arguments);
};

/**
* Read and return a file's contents.
* @method file.read(filepath [, encoding])
* @param filepath
* @param encoding
* @returns {strign}
*/
exports.read = function (filepath, encoding) {
    if (encoding === 'utf-8') {
        encoding = 'utf8';
    }
    if (!encoding) {
        encoding = 'utf8';
    }

    filepath = exports.normalize(filepath);
    var data = fs.readFileSync(filepath, encoding);

    // Hmm, would not expect to get A BOM, but it seems to happen,
    // remove it just in case.
    if (data.indexOf('\uFEFF') === 0) {
        data = data.substring(1, data.length);
    }

    return data;
};

/**
* write the specified contents to a file, creating intermediate directories if necessary
* @method file.write(filepath, contents [, encoding])
* @param filepath
* @param contents
* @param encoding
* @returns {string} filepath
*/
exports.write = function (filepath, contents, encoding) {
    // summary: saves a *text* file.
    var parentDir;

    if (encoding === 'utf-8') {
        encoding = 'utf8';
    }
    if (!encoding) {
        encoding = 'utf8';
    }

    // Make sure destination directories exist.
    parentDir = path.dirname(filepath);
    if (!exports.exists(parentDir)) {
        exports.mkdir(parentDir);
    }
    // filter query string
    filepath = exports.normalize(filepath);
    fs.writeFileSync(filepath, contents, encoding);
    return filepath;
};

/**
* given a path to a directory, create it, and all the intermediate directories as well
* @method file.mkdir(dirpath [, mode])
* @param dirpath the path to create
* @param mode
* @example
* file.mkdir("/tmp/dir", 755)
*/
exports.mkdir = function (dirpath, mode) {
    mkdirp.sync(dirpath, mode);
    return dirpath;
};


