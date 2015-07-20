/* global describe, it, beforeEach */

'use strict';

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
            NADDA: '/',
            PROJ: process.cwd()
        };
        testee = proxyquire('../../../../lib/utils/merge-settings-file', stubs);
    });

    it('should merge in external file', function () {
        testee('tests/unit/lib/fixtures/ext-settings.json');
        var newContent = JSON.parse(stubs.fs.writeFileSync.args[0][1]);
        /*jshint camelcase:false */
        assert.equal(typeof newContent.test_settings, 'object');
        assert.equal(newContent.selenium.port, 5555);
        assert.equal(newContent.test_settings.default.selenium_port, 5555);
        assert(newContent.test_settings.__PHANTOMJS__);
        /*jshint camelcase:true */
    });

    it('should log error if problem requiring in external settings file external file', function () {
        var consoleLogSpy = sinon.spy(console, 'log');
        testee('tests/unit/lib/fixtures/ext-settings-bad.json');
        assert.equal(consoleLogSpy.callCount, 1);
        assert.equal(consoleLogSpy.args[0][0], 'Cannot find module \'' + path.resolve('tests/unit/lib/fixtures/ext-settings-bad.json') + '\'');
        consoleLogSpy.restore();
    });

    it('should write file', function () {
        testee();
        assert.equal(stubs.fs.writeFileSync.callCount, 1);
        assert.equal(stubs.fs.writeFileSync.args[0][0], '/sandbox/nightwatch.json');
        assert.equal(stubs.fs.writeFileSync.args[0][2], 'UTF-8');
    });
});
