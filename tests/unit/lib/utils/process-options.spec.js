/* global describe, it, beforeEach, xit */

'use strict';

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    path = require('path'),
    sinon = require('sinon');

describe('utils/process-options', function () {

    var testee,
        stubs = {};
    beforeEach(function () {
        stubs['../options/localisation'] = {
            options: {ENGLISH: 'English'},
            isValid: sinon.stub().returns(true),
            getValue: sinon.stub({x: function(x){}}, 'x', function (x) {return x;})
        };
        stubs['../options/browser'] = {
            options: {PHANTOMJS: '__PHANTOMJS__'},
            isValid: sinon.stub().returns(true),
            getValue: sinon.stub({x: function(){}}, 'x', function (x) {return x;})
        };
        stubs['../paths'] = {
            NY_PATH: '/',
            PROJ_PATH: process.cwd()
        };
        stubs['object-merge'] = sinon.stub({x: function(){}}, 'x', function (x, y) {return y;});
        testee = proxyquire('../../../../lib/utils/process-options', stubs);
    });

    it('merges default and passed in options', function () {
        var options = {
            features: 'path/to/features',
            steps: 'path/to/steps'
        };
        testee(options);
        assert.equal(stubs['object-merge'].callCount, 1);
        assert.equal(stubs['object-merge'].args[0][0].features, '**/*.feature');
        assert.equal(stubs['object-merge'].args[0][0].steps, '**/*.steps.js');
        assert.equal(stubs['object-merge'].args[0][1].features, options.features);
        assert.equal(stubs['object-merge'].args[0][1].steps, options.steps);
    });

    describe('localisation', function () {
        describe('if localisation provided is invalid', function () {
            it('throws TypeError', function () {
                stubs['../options/localisation'].isValid.returns(false);
                var options = {
                    localisation: 'BAD_VAL'
                };
                assert.throws(function () {
                    testee(options);
                }, TypeError, 'Localisation value is invalid - ' + options.localisation);
            });
        });

        describe('if localisation is valid', function () {
            it('calls get value on localisation options module', function () {
                var options = {
                        localisation: 'ENGLISH'
                    },
                    newOptions;
                stubs['../options/localisation'].getValue = sinon.stub().returns('LOCALISATION_OPTION');
                newOptions = testee(options);
                assert.equal(stubs['../options/localisation'].getValue.callCount, 1);
                assert.equal(stubs['../options/localisation'].getValue.args[0][0], 'ENGLISH');
                assert.equal(newOptions.localisation, '\"LOCALISATION_OPTION\"');
            });

            it('if not null it is stingify\'d', function () {
                var options = {
                        localisation: 'ENGLISH'
                    },
                    newOptions = testee(options);
                assert.equal(newOptions.localisation, '\"ENGLISH\"');
            });
        });
    });

    describe('env', function () {
        it('calls getValue on browser options module', function () {
            var options = {
                    env: 'PHANTOMJS'
                },
                newOptions;
            stubs['../options/browser'].getValue = sinon.stub().returns('BROWSER_OPTION');
            newOptions = testee(options);
            assert.equal(stubs['../options/browser'].getValue.callCount, 1);
            assert.equal(stubs['../options/browser'].getValue.args[0][0], 'PHANTOMJS');
            assert.equal(newOptions.env, 'BROWSER_OPTION');
        });

        it('if getValue return null it leaves the env option as it was', function () {
            var options = {
                    env: 'BLITZ'
                },
                newOptions;
            stubs['../options/browser'].getValue = sinon.stub().returns(null);
            newOptions = testee(options);
            assert.equal(newOptions.env, options.env);
        });
    });

    it('returns processed options', function () {
        var options = testee({
            env: 'CHROMEO',
            localisation: 'ENGLISH'
        });
        assert(options);
    });
});
