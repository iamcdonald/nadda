/* global describe, it, beforeEach, xit */

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
            NADDA: '/',
            PROJ: process.cwd()
        };
        stubs['object-merge'] = sinon.stub({x: function(){}}, 'x', function (x, y) {return y;});
        testee = proxyquire('../../../../lib/utils/process-options', stubs);
    });

    it('merges default and passed in options', function () {
        var options = {
            features: 'path/to/features',
            steps: 'path/to/steps',
            tags: null
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
                    localisation: 'BAD_VAL',
                    tags: null
                };
                assert.throws(function () {
                    testee(options);
                }, TypeError, 'Localisation value is invalid - ' + options.localisation);
            });
        });

        describe('if localisation is valid', function () {
            it('calls get value on localisation options module', function () {
                var options = {
                        localisation: 'ENGLISH',
                        tags: null
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
                        localisation: 'ENGLISH',
                        tags: null
                    },
                    newOptions = testee(options);
                assert.equal(newOptions.localisation, '\"ENGLISH\"');
            });
        });
    });

    describe('env', function () {
        it('calls getValue on browser options module', function () {
            var options = {
                    env: 'PHANTOMJS',
                    tags: null
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
                    env: 'BLITZ',
                    tags: null
                },
                newOptions;
            stubs['../options/browser'].getValue = sinon.stub().returns(null);
            newOptions = testee(options);
            assert.equal(newOptions.env, options.env);
        });
    });

    describe('tags', function () {
        it('should process array of strings to valid format', function () {
            var options = {
                tags: ['@stuff']
            };
            assert.doesNotThrow(function () {
                testee(options);
            }, TypeError, 'Tags should be 2d array of strings, format is invalid - ' + JSON.stringify(options.tags));
        });


        it('should process single string to valid format', function () {
            var options = {
                tags: '@stuff'
            };
            assert.doesNotThrow(function () {
                testee(options);
            }, TypeError, 'Tags should be 2d array of strings, format is invalid - ' + JSON.stringify(options.tags));
        });

        it('should process null to valid format', function () {
            var options = {
                tags: null
            };
            assert.doesNotThrow(function () {
                testee(options);
            }, TypeError, 'Tags should be 2d array of strings, format is invalid - ' + JSON.stringify(options.tags));
        });

        it('should throw TypeError if tags format is not 2d array of strings - I', function () {
            var options = {
                tags: [[['@stuff']]]
            };
            assert.throws(function () {
                testee(options);
            }, TypeError, 'Tags should be 2d array of strings, format is invalid - ' + JSON.stringify(options.tags));
        });

        it('should throw TypeError if tags format is not 2d array of strings - II', function () {
            var options = {
                tags: [[1], [2]]
            };
            assert.throws(function () {
                testee(options);
            }, TypeError, 'Tags should be 2d array of strings, format is invalid - ' + JSON.stringify(options.tags));
        });

        it('should throw TypeError if tags format is not 2d array of strings - III', function () {
            var options = {
                tags: [1]
            };
            assert.throws(function () {
                testee(options);
            }, TypeError, 'Tags should be 2d array of strings, format is invalid - ' + JSON.stringify(options.tags));
        });

        it('should not throw TypeError if tags format is 2d array of strings', function () {
            var options = {
                tags: [['@a', '@b'], ['~@d']]
            };
            assert.doesNotThrow(function () {
                testee(options);
            }, TypeError);
        });
    });

    it('handles being passed nothing', function () {
        assert.doesNotThrow(function () {
            testee();
        }, Error);
    });

    it('returns processed options', function () {
        var options = testee({
            env: 'CHROMEO',
            localisation: 'ENGLISH',
            tags: []
        });
        assert(options);
    });
});
