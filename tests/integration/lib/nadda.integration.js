/* global before, after, describe, it, beforeEach, afterEach */

'use strict';

var assert = require('assert'),
    fs = require('fs'),
    proxyquire = require('proxyquire'),
    glob = require('glob-all'),
    path = require('path'),
    paths = require('../../../lib/paths'),
    sinon = require('sinon');

describe('nadda integration', function () {

    var processExitStub = sinon.stub(process, 'exit');
    before(function () {
        require('../../../lib/driver-setup');
    });

    after(function () {
        fs.unlinkSync('lib/nightwatch-default.json');
        processExitStub.restore();
    });

    describe('default options', function () {
        var testee,
            stubs = {},
            nightwatchCallback;

        beforeEach(function () {
            stubs.nightwatch = {
                runner: sinon.stub()
            };
            stubs.deferResolve = sinon.stub();
            stubs.deferReject = sinon.stub();
            stubs.q = {
                defer: sinon.stub().returns({
                    resolve: stubs.deferResolve,
                    reject: stubs.deferReject
                })
            };
            testee = proxyquire('../../../lib/nadda', stubs);
            testee();
            nightwatchCallback = stubs.nightwatch.runner.args[0][1];
        });

        afterEach(function () {
            nightwatchCallback();
            delete require.cache[path.resolve('./lib/sandbox/nightwatch.json')];
        });

        it('should create a settings file with paths to drivers/selenium and external settings rolled in', function () {
            var settings = require(path.resolve('./lib/sandbox/nightwatch.json'));
            /*jshint camelcase:false */
            assert(settings.selenium.server_path);
            assert(settings.selenium.cli_args['webdriver.chrome.driver']);
            if (process.platform === 'win32') {
                assert(settings.selenium.cli_args['webdriver.ie.driver']);
            }
            assert.equal(settings.selenium.port, 4444);
            assert(settings.test_settings);
            /*jshint camelcase:true */
        });

        it('should create a file for each feature with the correct contents', function () {
            var files,
                features,
                filename,
                found,
                fileContents,
                re;

            files = glob.sync('lib/sandbox/features/**/*.js');
            assert.equal(files.length, 3);

            features = glob.sync(['**/*.feature', '!node_modules/**/*']);
            features.forEach(function (feature) {
                filename = 'lib/sandbox/features/' + feature.replace('\.feature', '.js');
                found = false;
                for (var i = 0, l = files.length; i < l; i++) {
                    if (files[i].replace(__dirname, '')  === filename){
                        found = files[i];
                        break;
                    }
                }
                assert(found);

                fileContents = fs.readFileSync(found, 'UTF-8');
                re = new RegExp(feature);
                assert(fileContents.match(re));
                re = new RegExp(paths.NADDA);
                assert(fileContents.match(re));
                re = new RegExp('[[]]');
                assert(fileContents.match(re));

            });
        });

        it('should create a steps-lib file with the correct contents', function () {
            var fileContents = fs.readFileSync(path.resolve('./lib/sandbox/steps-lib.js'), 'UTF-8'),
                re;
            re = new RegExp('[\'**/*.steps.js\', \`!node_modules/**/*\`]');
            assert(fileContents.match(re));
            re = new RegExp('null');
            assert(fileContents.match(re));
        });

        it('should call nightwatch.runner with the correct config', function () {
            assert.equal(stubs.nightwatch.runner.callCount, 1);
            assert.deepEqual(stubs.nightwatch.runner.args[0][0], {
                config:path.resolve(__dirname, '../../../lib/sandbox/nightwatch.json'),
                env: testee.BROWSERS.PHANTOMJS
            });
        });

        it('should pass in callback that deletes sandbox and calls passed in done', function () {
            var callback = stubs.nightwatch.runner.args[0][1],
                rimrafSpy = sinon.spy(require('rimraf'), 'sync');
            callback();
            assert.equal(stubs.deferResolve.callCount, 1);
            assert.equal(rimrafSpy.callCount, 1);
            assert.equal(rimrafSpy.args[0][0], path.resolve(__dirname, '../../../lib/sandbox'));
            rimrafSpy.restore();
        });
    });

    describe('passed options', function () {
        var testee,
            stubs = {},
            featuresPath = ['tests/integration/lib/fixture/**/*.feature'],
            stepsPath = ['tests/integration/lib/fixture/**/*.steps.js'],
            configPath = './tests/integration/lib/fixture/ext-nightwatch.json',
            nightwatchCallback;

        beforeEach(function () {
            stubs.nightwatch = {
                runner: sinon.stub()
            };
            stubs.deferResolve = sinon.stub();
            stubs.deferReject = sinon.stub();
            stubs.q = {
                defer: sinon.stub().returns({
                    resolve: stubs.deferResolve,
                    reject: stubs.deferReject
                })
            };
            testee = proxyquire('../../../lib/nadda', stubs);
            testee({
                features: featuresPath,
                steps: stepsPath,
                localisation: testee.LOCALISATIONS.ENGLISH,
                config: configPath,
                env: testee.BROWSERS.IE
            });
            nightwatchCallback = stubs.nightwatch.runner.args[0][1];
        });

        afterEach(function () {
            nightwatchCallback();
        });

        it('should create a settings file with paths to drivers/selenium and external settings rolled in', function () {
            var settings = require(path.resolve('./lib/sandbox/nightwatch.json'));
            /*jshint camelcase:false */
            assert(settings.selenium.server_path);
            assert(settings.selenium.cli_args['webdriver.chrome.driver']);
            if (process.platform === 'win32') {
                assert(settings.selenium.cli_args['webdriver.ie.driver']);
            }
            assert.equal(settings.selenium.port, 6655);
            assert(settings.test_settings.default);
            /*jshint camelcase:true */
        });

        it('should create a file for each feature with the correct contents', function () {
            var files,
                features,
                filename,
                found,
                fileContents,
                re;

            files = glob.sync('lib/sandbox/features/**/*.js');
            assert.equal(files.length, 2);

            features = glob.sync(featuresPath);
            features.forEach(function (feature) {
                filename = path.basename(feature).replace(/\..*/, '');
                found = false;
                for (var i = 0, l = files.length; i < l; i++) {
                    if (path.basename(files[i]) === filename + '.js'){
                        found = files[i];
                        break;
                    }
                }
                assert(found);

                re = new RegExp(feature);
                fileContents = fs.readFileSync(found, 'UTF-8');
                assert(fileContents.match(re));

            });
        });

        it('should create a steps-lib file with the correct contents', function () {
            var fileContents = fs.readFileSync(path.resolve('./lib/sandbox/steps-lib.js'), 'UTF-8'),
                re;
            re = new RegExp(JSON.stringify(stepsPath));
            assert(fileContents.match(re));
            re = new RegExp(testee.LOCALISATIONS.ENGLISH);
            assert(fileContents.match(re));
        });

        it('should call nightwatch.runner with the correct config', function () {
            assert.equal(stubs.nightwatch.runner.callCount, 1);
            assert.deepEqual(stubs.nightwatch.runner.args[0][0], {
                config: path.resolve(__dirname, '../../../lib/sandbox/nightwatch.json'),
                env: testee.BROWSERS.IE
            });
        });

        it('should pass in callback that deletes sandbox and calls passed in done', function () {
            var callback = stubs.nightwatch.runner.args[0][1],
                rimrafSpy = sinon.spy(require('rimraf'), 'sync');
            callback();
            assert.equal(stubs.deferResolve.callCount, 1);
            assert.equal(rimrafSpy.callCount, 1);
            assert.equal(rimrafSpy.args[0][0], path.resolve(__dirname, '../../../lib/sandbox'));
            rimrafSpy.restore();
        });
    });
});
