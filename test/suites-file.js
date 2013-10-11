/**
 * A test suite.
 */

// node libs.
var assert = require("assert");

// internal libs.
var log = require('../lib/utils/log');

describe('utils', function() {
    describe('#log', function() {
        it('should return undefined when the value is not present', function() {
            assert.equal(undefined, log.writeln());
            assert.equal(undefined, log.info());
            assert.equal(undefined, log.warn());
            // assert.equal(undefined, log.error());
        });
    });
});