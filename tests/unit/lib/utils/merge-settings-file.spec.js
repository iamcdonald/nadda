/* global describe, it, beforeEach, xit */

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    path = require('path'),
    sinon = require('sinon');

describe('utils/merge-settings-file', function () {

    var testee,
        stubs = {};
    beforeEach(function () {
        stubs.fs = {
            writeFileSync: sinon.stub()
        };
        stubs['glob-all'] = {
            sync: sinon.stub().returns([])
        };
        stubs['../nightwatch-default.json'] = require('../fixtures/settings.json');
        stubs['../paths'] = {
            NY_PATH: '/',
            PROJ_PATH: process.cwd()
        };
        testee = proxyquire('../../../../lib/utils/merge-settings-file', stubs);
    });

    it('should merge in external file', function () {
        testee('tests/unit/lib/fixtures/ext-settings.json');
        var newContent = JSON.parse(stubs.fs.writeFileSync.args[0][1]);
        assert.equal(typeof newContent.test_settings, 'object');
        assert.equal(newContent.selenium.port, 5555);
        assert.equal(newContent.test_settings.default.selenium_port, 5555);
        assert(newContent.test_settings.__PHANTOMJS__);
    });

    it('should write file', function () {
        testee('tests/unit/lib/fixtures/ext-settings.json');
        assert.equal(stubs.fs.writeFileSync.callCount, 1);
        assert.equal(stubs.fs.writeFileSync.args[0][0], '/sandbox/nightwatch.json');
        assert.equal(stubs.fs.writeFileSync.args[0][2], 'UTF-8');
    });
});
