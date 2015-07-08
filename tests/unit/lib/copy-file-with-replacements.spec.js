/* global describe, it, beforeEach */

'use strict';

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon');

describe('copy-file-with-replacement', function () {

    var testee,
        stubs = {};
    beforeEach(function () {
        stubs.fs = {
            readFileSync: sinon.stub().returns('some test with\na\nword - (find)\n to replace'),
            writeFileSync: sinon.stub()
        };
        testee = proxyquire('../../../lib/copy-file-with-replacements', stubs);
    });

    it('should call readFileSync with the file location and \'UTF-8\'', function () {
        testee('read/location/path.js', 'write/location/path.js', {
            'find': 'replace'
        });
        assert.equal(stubs.fs.readFileSync.callCount, 1);
        assert.equal(stubs.fs.readFileSync.args[0][0], 'read/location/path.js');
        assert.equal(stubs.fs.readFileSync.args[0][1], 'UTF-8');
    });

    it('should call writeFileSync with the new file location, the contents post replacement and \'UTF-8\'', function () {
        testee('read/location/path.js', 'write/location/path.js', {
            'find': 'replace'
        });
        assert.equal(stubs.fs.writeFileSync.callCount, 1);
        assert.equal(stubs.fs.writeFileSync.args[0][0], 'write/location/path.js');
        assert.equal(stubs.fs.writeFileSync.args[0][1], stubs.fs.readFileSync().replace(/find/g, 'replace'));
        assert.equal(stubs.fs.writeFileSync.args[0][2], 'UTF-8');
    });

    it('should replace multiple \'find\' variable occurences within file with \'replace\' variable', function () {
        stubs.fs.readFileSync.returns('a {find} and another\n {find}');
        testee('read/location/path.js', 'write/location/path.js', {
            '{find}': 'replace'
        });
        assert.equal(stubs.fs.writeFileSync.callCount, 1);
        assert.equal(stubs.fs.writeFileSync.args[0][1], 'a replace and another\n replace');
    });
});
