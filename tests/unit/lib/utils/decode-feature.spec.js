/* global describe, it, beforeEach, afterEach */

'use strict';

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon');

describe('utils/decode-feature', function () {

    var testee,
        returnVal,
        stubs = {},
        featureFilePath = 'dummy/path/to/feature.feature',
        tagRules = [
            ['~@1'],
            ['@2', '@3'],
            ['@4']
        ];

    beforeEach(function () {
        stubs.fs = {
            readFileSync: sinon.stub().returns('a feature'),
            writeFileSync: sinon.stub()
        };
        stubs['/sandbox/steps-lib'] = {
            yadda: sinon.stub()
        };
        stubs['../paths'] = {
            NADDA: '/'
        };
        stubs['/utils/should-run-scenario'] = sinon.stub();
        stubs.featureParserParse = sinon.stub().returns({
            scenarios: Array.apply(null, {length: 6}).map(function (scenario, idx) {
                return {
                    annotations: {},
                    title: 'scenario' + idx,
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
        stubs['console.log'] = sinon.stub(console, 'log');
        testee = proxyquire('../../../../lib/utils/decode-feature', stubs);
        returnVal = testee(featureFilePath, tagRules);
    });

    afterEach(function () {
        stubs['console.log'].restore();
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

    describe('feature title and description', function () {

        describe('if feature has no title or description', function () {
            it('should not add --Feature-- scenario', function () {
                assert.equal(returnVal['--Feature--'], undefined);
            });
        });

        describe('if feature has title attached', function () {
            var featureVal;
            beforeEach(function () {
                featureVal = stubs.featureParserParse();
                featureVal.title = 'A title';
                stubs.featureParserParse.returns(featureVal);
                returnVal = testee(featureFilePath, tagRules);
            });

            it('should add --Feature-- scenario to print title out to console', function () {
                assert.equal(typeof returnVal['--Feature--'], 'function');
                var browserStub = {
                        perform: sinon.stub()
                    };
                returnVal['--Feature--'](browserStub);
                assert.equal(browserStub.perform.callCount, 1);
                browserStub.perform.args[0][0]();
                assert.equal(stubs['console.log'].callCount, 1);
                assert.equal(stubs['console.log'].args[0][0], featureVal.title);
            });
        });

        describe('if feature has description attached', function () {
            var featureVal;
            beforeEach(function () {
                featureVal = stubs.featureParserParse();
                featureVal.description = ['A', 'description', 'string'];
                stubs.featureParserParse.returns(featureVal);
                returnVal = testee(featureFilePath, tagRules);
            });

            it('should add --Feature-- scenario to print description out to console', function () {
                assert.equal(typeof returnVal['--Feature--'], 'function');
                var browserStub = {
                        perform: sinon.stub()
                    };
                returnVal['--Feature--'](browserStub);
                assert.equal(browserStub.perform.callCount, 1);
                browserStub.perform.args[0][0]();
                assert.equal(stubs['console.log'].callCount, 1);
                assert.equal(stubs['console.log'].args[0][0], featureVal.description.join('\n'));
            });
        });

        describe('if feature has title and description attached', function () {
            var featureVal;
            beforeEach(function () {
                featureVal = stubs.featureParserParse();
                featureVal.title = 'A feature title';
                featureVal.description = ['A', 'description', 'string'];
                stubs.featureParserParse.returns(featureVal);
                returnVal = testee(featureFilePath, tagRules);
            });

            it('should add --Feature-- scenario to print description out to console', function () {
                assert.equal(typeof returnVal['--Feature--'], 'function');
                var browserStub = {
                        perform: sinon.stub()
                    };
                returnVal['--Feature--'](browserStub);
                assert.equal(browserStub.perform.callCount, 1);
                browserStub.perform.args[0][0]();
                assert.equal(stubs['console.log'].callCount, 2);
                assert.equal(stubs['console.log'].args[0][0], featureVal.title);
                assert.equal(stubs['console.log'].args[1][0], featureVal.description.join('\n'));
            });
        });
    });

    it('should export function for each scenario', function () {
        var scenarios = stubs.featureParserParse().scenarios;
        scenarios.forEach(function (scenario) {
            assert.equal(typeof returnVal[scenario.title], 'function');
        });
    });

    describe('created scenario function', function () {

        describe('scenario has correct tags', function () {

            var scenario,
                featureVal;
            beforeEach(function () {
                featureVal = stubs.featureParserParse();
                featureVal.scenarios[3].annotations['2'] = true;
                featureVal.scenarios[3].annotations['3'] = true;
                stubs.featureParserParse.returns(featureVal);
                scenario = featureVal.scenarios[3];
                stubs['/utils/should-run-scenario'].returns(true);

            });

            it('should export function that runs scenario', function () {
                var scenarioFunc = returnVal[scenario.title],
                    browser = {
                        perform: sinon.stub()
                    };

                scenarioFunc(browser);
                assert.equal(stubs['/utils/should-run-scenario'].callCount, 1);
                assert.deepEqual(stubs['/utils/should-run-scenario'].args[0][0], tagRules);
                assert.deepEqual(stubs['/utils/should-run-scenario'].args[0][1], ['@2', '@3']);
                assert.equal(stubs['/sandbox/steps-lib'].yadda.callCount, scenario.steps.length);
                for (var i = 0, l = scenario.steps.length; i < l; i++) {
                    assert.equal(stubs['/sandbox/steps-lib'].yadda.args[i][0], scenario.steps[i]);
                    assert.deepEqual(stubs['/sandbox/steps-lib'].yadda.args[i][1].browser, browser);
                }
            });

            it('should log each step when running scenario except \'close_browser\'', function () {
                var scenarioFunc = returnVal[scenario.title],
                    browser = {
                        perform: sinon.stub()
                    };
                scenarioFunc(browser);
                for (var i = 0, l = scenario.steps.length - 1; i < l; i++) {
                    browser.perform.args[i][0]();
                    assert.equal(stubs['console.log'].args[i][0], '- ');
                    assert.equal(stubs['console.log'].args[i][1], scenario.steps[i]);
                }
            });
        });

        describe('scenario does not have correct tags', function () {

            var scenario,
                featureVal;
            beforeEach(function () {
                featureVal = stubs.featureParserParse();
                featureVal.scenarios[1].annotations['1'] = true;
                featureVal.scenarios[1].annotations['2'] = true;
                stubs.featureParserParse.returns(featureVal);
                scenario = featureVal.scenarios[1];
            });

            it('should export function that logs reason for not running the scenario', function () {
                var scenarioFunc = returnVal[scenario.title],
                    browser = {
                        end: sinon.stub()
                    };

                stubs['/utils/should-run-scenario'].returns(false);
                scenarioFunc(browser);
                assert.equal(stubs['/utils/should-run-scenario'].callCount, 1);
                assert.deepEqual(stubs['/utils/should-run-scenario'].args[0][0], tagRules);
                assert.deepEqual(stubs['/utils/should-run-scenario'].args[0][1], ['@1', '@2']);
                assert.equal(stubs['console.log'].callCount, 1);
                assert.equal(stubs['console.log'].args[0][0], 'Not running scenario due to tag rules supplied');
                assert.equal(browser.end.callCount, 1);
            });
        });
    });

});
