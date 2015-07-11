/* global describe, it, beforeEach, afterEach */

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    path = require('path'),
    sinon = require('sinon');

describe('driver-setup', function () {

    var stubs = {},
        fileContent;

    beforeEach(function () {
        stubs.processExit = sinon.stub(process, 'exit');
        stubs.consoleLog = sinon.spy(console, 'log');
        stubs.fs = {
            writeFileSync: sinon.stub()
        };
        stubs['glob-all'] = {
            sync: sinon.stub().returns([])
        };
        stubs['./nightwatch-default-template.json'] = require('./fixtures/settings.json');
        stubs['./paths'] = {
            NY_PATH: '/',
            PROJ_PATH: process.cwd()
        };
    });

    afterEach(function () {
        stubs.processExit.restore();
        stubs.consoleLog.restore();
    });

    function loadTestee() {
        proxyquire('../../../lib/driver-setup', stubs);
        fileContent = JSON.parse(stubs.fs.writeFileSync.args[0][1]);
    }

    describe('all platforms', function () {
        it('should set paths as undefined if selenium driver does not exist', function () {
            loadTestee();
            assert.equal(fileContent.selenium.server_path, '');
        });

        it('should correctly add selenium server path if available', function () {
            var seleniumPath = '/the/path/to/selenium.jar';
            stubs['glob-all'].sync
                            .withArgs('/node_modules/selenium-standalone-wrapper/*.jar')
                            .returns([seleniumPath]);
            loadTestee();
            assert.equal(fileContent.selenium.server_path, seleniumPath);
        });

        it('should correctly add chrome driver path if available', function () {
            loadTestee();
            assert.equal(fileContent.selenium.cli_args['webdriver.chrome.driver'],
                            '/node_modules/chromedriver/bin/chromedriver');
        });

        it('should correctly add phantomjs driver path if available', function () {
            loadTestee();
            assert.equal(fileContent.test_settings.__PHANTOMJS__.desiredCapabilities['phantomjs.binary.path'],
                            '/node_modules/phantomjs/bin/phantomjs');
        });

        it('should write file', function () {
            loadTestee();
            assert.equal(stubs.fs.writeFileSync.callCount, 1);
            assert.equal(stubs.fs.writeFileSync.args[0][0], '/nightwatch-default.json');
            assert.equal(stubs.fs.writeFileSync.args[0][2], 'UTF-8');
        });
    });

    describe('non win32 platform', function () {

        var platform = process.platform;
        beforeEach(function () {
            Object.defineProperty(process, 'platform', {
                value: 'darwin'
            });
        });

        afterEach(function () {
            Object.defineProperty(process, 'platform', {
                value: platform
            });
        });

        it('should remove __IE__ property from test_settings', function () {
            loadTestee();
            assert(!fileContent.test_settings.__IE__);
        });

        it('should console.log reason for not installing iedriver', function () {
            loadTestee();
            assert.equal(stubs.consoleLog.callCount, 1);
            assert.equal(stubs.consoleLog.args[0][0], 'Skipping iedriver install as it is useless on darwin platform.');
        });

        it('should call process.exit with false', function () {
            loadTestee();
            assert.equal(stubs.processExit.callCount, 1);
            assert.equal(stubs.processExit.args[0][0], false);
        });

    });

    describe('win32 platform', function () {

        var platform = process.platform;
        beforeEach(function () {
            Object.defineProperty(process, 'platform', {
                value: 'win32'
            });
        });

        afterEach(function () {
            Object.defineProperty(process, 'platform', {
                value: platform
            });
        });

        it('should correctly add ie driver path if available', function () {
            loadTestee();
            assert.equal(fileContent.selenium.cli_args['webdriver.ie.driver'], path.resolve('/node_modules/iedriver/bin/iedriver'));
        });

        it('should call process.exit with true', function () {
            loadTestee();
            assert.equal(stubs.processExit.callCount, 1);
            assert.equal(stubs.processExit.args[0][0], true);
        });
    });
});
