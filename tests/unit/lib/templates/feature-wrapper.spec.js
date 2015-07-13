/* global before, after, describe, it, beforeEach */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    copyFileWithReplacements = require('../../../../lib/utils/copy-file-with-replacements'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon');

describe('templates/feature-wrapper', function () {

    var testee,
        stubs = {},
        featureFilePath = 'dummy/path/to/feature.feature',
        NY_PATH = '/',
        tagRules = [
            ['~@1'],
            ['@2', '@3'],
            ['@4']
        ];

    before(function () {
        fs.mkdirSync(path.resolve(__dirname, 'sandbox'));
        copyFileWithReplacements(path.resolve(__dirname, '../../../../lib/templates/feature-wrapper-template.txt'),
                                path.resolve(__dirname, 'sandbox/feature-wrapper.js'),
                                {
                                    '{feature_location}': featureFilePath,
                                    '{ny_path}': NY_PATH,
                                    '{tag_rules}': JSON.stringify(tagRules)
                                });
    });

    after(function () {
        rimraf.sync(path.resolve(__dirname, 'sandbox'));
    });

    beforeEach(function () {
        stubs.fs = {
            readFileSync: sinon.stub().returns('a feature'),
            writeFileSync: sinon.stub()
        };
        stubs['/sandbox/steps-lib'] = {
            yadda: sinon.stub()
        };
        stubs['/utils/should-run-scenario'] = sinon.stub();
        stubs.featureParserParse = sinon.stub().returns({
            scenarios: Array.apply(null, {length: 6}).map(function (scenario, idx) {
                var annotations = {};
                annotations[idx] = true;
                annotations[(idx + 1)] = true;
                return {
                    title: 'scenario' + idx,
                    annotations: annotations,
                    steps: Array.apply(null, {length: idx+1}).map(function (_, idx) {
                        return idx;
                    })
                };
            })
        });
        stubs.yadda = {
            parsers: {
                FeatureParser: function () {
                    return {
                        parse: stubs.featureParserParse
                    };
                }
            }
        };
        testee = proxyquire('./sandbox/feature-wrapper', stubs);
    });

    it('should read feature file', function () {
        assert.equal(stubs.fs.readFileSync.callCount, 1);
        assert.equal(stubs.fs.readFileSync.args[0][0], featureFilePath);
        assert.equal(stubs.fs.readFileSync.args[0][1], 'UTF-8');
    });

    it('should parse file', function () {
        assert.equal(stubs.featureParserParse.callCount, 1);
        assert.equal(stubs.featureParserParse.args[0][0], stubs.fs.readFileSync());
    });

    it('should export function for each scenario', function () {
        var scenarios = stubs.featureParserParse().scenarios;
        scenarios.forEach(function (scenario) {
            assert.equal(typeof testee[scenario.title], 'function');
        });
    });

    it('should export function that runs scenario if it passes the tag test', function () {
        var scenario = stubs.featureParserParse().scenarios[0],
            scenarioFunc = testee[scenario.title];

        stubs['/utils/should-run-scenario'].returns(true);
        scenarioFunc('browser');
        assert.equal(stubs['/utils/should-run-scenario'].callCount, 1);
        assert.deepEqual(stubs['/utils/should-run-scenario'].args[0][0], tagRules);
        assert.deepEqual(stubs['/utils/should-run-scenario'].args[0][1], ['@0', '@1']);
        assert.equal(stubs['/sandbox/steps-lib'].yadda.callCount, 1);
        assert.equal(stubs['/sandbox/steps-lib'].yadda.args[0][0], scenario.steps);
        assert.equal(stubs['/sandbox/steps-lib'].yadda.args[0][1].browser, 'browser');
    });

    it('should export function that logs reason for not running the scenario if it does not pass the tag test', function () {
        var scenario = stubs.featureParserParse().scenarios[1],
            scenarioFunc = testee[scenario.title],
            consoleLogSpy = sinon.spy(console, 'log'),
            browser = {
                end: sinon.stub()
            };

        stubs['/utils/should-run-scenario'].returns(false);
        scenarioFunc(browser);
        assert.equal(stubs['/utils/should-run-scenario'].callCount, 1);
        assert.deepEqual(stubs['/utils/should-run-scenario'].args[0][0], tagRules);
        assert.deepEqual(stubs['/utils/should-run-scenario'].args[0][1], ['@1', '@2']);
        assert.equal(consoleLogSpy.callCount, 1);
        assert.equal(consoleLogSpy.args[0][0], 'Not running scenario due to tag rules supplied');
        assert.equal(browser.end.callCount, 1);
        consoleLogSpy.restore();
    });



});
