/* global describe, it, beforeEach, afterEach */

'use strict';

var assert = require('assert'),
    fs = require('fs'),
    proxyquire = require('proxyquire'),
    glob = require('glob-all'),
    path = require('path'),
    sinon = require('sinon');

describe('nightwatch-yadda integration', function () {

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
            testee = proxyquire('../../lib/nightwatch-yadda', stubs);
            testee();
            nightwatchCallback = stubs.nightwatch.runner.args[0][1];
        });

        afterEach(function () {
            nightwatchCallback();
            delete require.cache[path.resolve('./lib/sandbox/nightwatch.json')];
        });

        it('should create a settings file with paths to drivers/selenium and external settings rolled in', function () {
            var settings = require(path.resolve('./lib/sandbox/nightwatch.json'));
            assert(settings.selenium.server_path);
            assert(settings.selenium.cli_args['webdriver.chrome.driver']);
            if (process.platform === 'win32') {
                assert(settings.selenium.cli_args['webdriver.ie.driver']);
            }
            assert.equal(settings.selenium.port, 4444);
            assert(settings.test_settings);
        });

        it('should create a file for each feature with the correct contents', function () {
            var done = sinon.stub(),
                files,
                features,
                filename,
                found,
                fileContents,
                re;

            files = glob.sync('lib/sandbox/features/**/*.js');
            assert.equal(files.length, 52);

            features = glob.sync('**/*.feature');
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

                re = new RegExp(feature);
                fileContents = fs.readFileSync(found, 'UTF-8');
                assert(fileContents.match(re));

            });
        });

        it('should create a yadda-lib file with the correct contents', function () {
            var fileContents = fs.readFileSync(path.resolve('./lib/sandbox/yadda-lib.js'), 'UTF-8'),
                re;
            re = new RegExp('**/*.steps.js'.replace(/(\/|\*)/g, '\\$1'));
            assert(fileContents.match(re));
            re = new RegExp('localisation = null');
            assert(fileContents.match(re));
        });

        it('should call nightwatch.runner with the correct config', function () {
            assert.equal(stubs.nightwatch.runner.callCount, 1);
            assert.deepEqual(stubs.nightwatch.runner.args[0][0], {
                config:path.resolve(__dirname, '../../lib/sandbox/nightwatch.json'),
                env: 'PHANTOMJS'
            });
        });

        it('should pass in callback that deletes sandbox and calls passed in done', function () {
            var callback = stubs.nightwatch.runner.args[0][1],
                rimrafSpy = sinon.spy(require('rimraf'), 'sync');
            callback();
            assert.equal(stubs.deferResolve.callCount, 1);
            assert.equal(rimrafSpy.callCount, 1);
            assert.equal(rimrafSpy.args[0][0], path.resolve(__dirname, '../../lib/sandbox'));
            rimrafSpy.restore();
        });
    });

    describe('passed options', function () {
        var testee,
            stubs = {},
            featuresPath = 'tests/integration/fixture/**/*.feature',
            stepsPath = 'tests/integration/fixture/**/*.steps.js',
            localisation = 'English',
            settingsPath = './tests/integration/fixture/ext-nightwatch.json',
            env = 'IE',
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
            testee = proxyquire('../../lib/nightwatch-yadda', stubs);
            testee({
                features: featuresPath,
                steps: stepsPath,
                localisation: localisation,
                settings: settingsPath,
                env: env
            });
            nightwatchCallback = stubs.nightwatch.runner.args[0][1];
        });

        afterEach(function () {
            nightwatchCallback();
            //delete require.cache[]
        });

        it('should create a settings file with paths to drivers/selenium and external settings rolled in', function () {
            var settings = require(path.resolve('./lib/sandbox/nightwatch.json'));
            assert(settings.selenium.server_path);
            assert(settings.selenium.cli_args['webdriver.chrome.driver']);
            if (process.platform === 'win32') {
                assert(settings.selenium.cli_args['webdriver.ie.driver']);
            }
            assert.equal(settings.selenium.port, 6655);
            assert(settings.test_settings);
            assert.equal(settings.test_settings.default.selenium_port, 6655);
        });

        it('should create a file for each feature with the correct contents', function () {
            var done = sinon.stub(),
                files,
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

        it('should create a yadda-lib file with the correct contents', function () {
            var fileContents = fs.readFileSync(path.resolve('./lib/sandbox/yadda-lib.js'), 'UTF-8'),
                re;
            re = new RegExp(stepsPath.replace(/(\/|\*)/g, '\\$1'));
            assert(fileContents.match(re));
            re = new RegExp(localisation);
            assert(fileContents.match(re));
        });

        it('should call nightwatch.runner with the correct config', function () {
            assert.equal(stubs.nightwatch.runner.callCount, 1);
            assert.deepEqual(stubs.nightwatch.runner.args[0][0], {
                config: path.resolve(__dirname, '../../lib/sandbox/nightwatch.json'),
                env: env
            });
        });

        it('should pass in callback that deletes sandbox and calls passed in done', function () {
            var callback = stubs.nightwatch.runner.args[0][1],
                rimrafSpy = sinon.spy(require('rimraf'), 'sync');
            callback();
            assert.equal(stubs.deferResolve.callCount, 1);
            assert.equal(rimrafSpy.callCount, 1);
            assert.equal(rimrafSpy.args[0][0], path.resolve(__dirname, '../../lib/sandbox'));
            rimrafSpy.restore();
        });
    });
});
