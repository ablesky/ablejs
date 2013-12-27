/**
 * A test suite.
 */
/* global describe:true, it:true */

// node libs.
var assert = require("assert");

// internal libs.
var log = require('../lib/utils/log');

describe('utils', function() {
    describe('#log', function() {
        var api_list = ['write', 'writeln', 'info', 'warn', 'error', 'debug'];

        it('should expose api: ' + api_list.join(','), function() {
            assert.equal(true, api_list.every(function(api) {
                return log[api] instanceof Function;
            }));
        });

        it('should return undefined when the value is not present', function() {
            assert.equal(undefined, log.writeln());
            assert.equal(undefined, log.info());
            assert.equal(undefined, log.warn());
            // assert.equal(undefined, log.error());
        });
    });
});