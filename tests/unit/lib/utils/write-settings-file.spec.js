/* global describe, it, beforeEach */

'use strict';

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    path = require('path'),
    sinon = require('sinon');

describe('merge-settings-to-file', function () {

    var testee,
        stubs = {};
    beforeEach(function () {
        stubs.fs = {
            writeFileSync: sinon.stub()
        };
        stubs['glob-all'] = {
            sync: sinon.stub().returns([])
        };
        testee = proxyquire('../../../../lib/utils/write-settings-file', stubs);
    });

    it('should write file to correct path', function () {
        testee(path.resolve(__dirname, '../fixtures/settings.json'),
                path.resolve(__dirname, '../fixtures/ext-settings.json'),
                'write/location/settings.json');
        assert.equal(stubs.fs.writeFileSync.callCount, 1);
        assert.equal(stubs.fs.writeFileSync.args[0][0], 'write/location/settings.json');
        assert.equal(stubs.fs.writeFileSync.args[0][2], 'UTF-8');
    });

    it('should set paths as undefined if selenium driver does not exist', function () {
        testee(path.resolve(__dirname, '../fixtures/settings.json'),
                path.resolve(__dirname, '../fixtures/ext-settings.json'),
                'write/location/settings.json');
        var newContent = JSON.parse(stubs.fs.writeFileSync.args[0][1]);
        assert.equal(newContent.selenium.server_path, '');
    });

    it('should correctly add selenium server path if available', function () {
        var seleniumPath = '/the/path/to/selenium.jar';
        stubs['glob-all'].sync
                        .withArgs(path.resolve('node_modules/selenium-standalone-wrapper/*.jar'))
                        .returns([seleniumPath]);
        testee(path.resolve(__dirname, '../fixtures/settings.json'),
                path.resolve(__dirname, '../fixtures/ext-settings.json'),
                'write/location/settings.json');
        var newContent = JSON.parse(stubs.fs.writeFileSync.args[0][1]);
        assert.equal(newContent.selenium.server_path, seleniumPath);
    });

    it('should correctly add chrome driver path if available', function () {
        testee(path.resolve(__dirname, '../fixtures/settings.json'),
                path.resolve(__dirname, '../fixtures/ext-settings.json'),
                'write/location/settings.json');
        var newContent = JSON.parse(stubs.fs.writeFileSync.args[0][1]);
        assert.equal(newContent.selenium.cli_args['webdriver.chrome.driver'], path.resolve('node_modules/chromedriver/bin/chromedriver'));
    });

    it('should correctly add ie driver path if available', function () {
        testee(path.resolve(__dirname, '../fixtures/settings.json'),
                path.resolve(__dirname, '../fixtures/ext-settings.json'),
                'write/location/settings.json');
        var newContent = JSON.parse(stubs.fs.writeFileSync.args[0][1]);
        assert.equal(newContent.selenium.cli_args['webdriver.ie.driver'], path.resolve('node_modules/iedriver/bin/iedriver'));
    });

    it('should correctly add phantomjs driver path if available', function () {
        testee(path.resolve(__dirname, '../fixtures/settings.json'),
                path.resolve(__dirname, '../fixtures/ext-settings.json'),
                'write/location/settings.json');
        var newContent = JSON.parse(stubs.fs.writeFileSync.args[0][1]);
        assert.equal(newContent.test_settings.__PHANTOMJS__['phantomjs.binary.path'], path.resolve('node_modules/phantomjs/bin/phantomjs'));
    });

    it('should merge in external file', function () {
        testee(path.resolve(__dirname, '../fixtures/settings.json'),
                path.resolve(__dirname, '../fixtures/ext-settings.json'),
                'write/location/settings.json');
        var newContent = JSON.parse(stubs.fs.writeFileSync.args[0][1]);
        assert.equal(typeof newContent.test_settings, 'object');
        assert.equal(newContent.selenium.port, 5555);
        assert.equal(newContent.test_settings.default.selenium_port, 5555);
    });
});
