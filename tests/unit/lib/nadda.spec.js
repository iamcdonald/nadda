/* global describe, it, beforeEach */

'use strict';

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    path = require('path'),
    sinon = require('sinon'),
    objectMerge = require('object-merge');

describe('nadda', function () {

    var testee,
        stubs = {};

    stubs['object-merge'] = sinon.spy(objectMerge);
    beforeEach(function () {
        stubs.mkdirp = {
            sync: sinon.stub()
        };
        stubs['./utils/merge-settings-file'] = sinon.stub();
        stubs['./utils/copy-file-with-replacements'] = sinon.stub();
        stubs['./utils/process-options'] = sinon.stub({x: function () {}}, 'x', function (options) {
            return options || {};
        });
        stubs['./options/localisation'] = {
            options: {ENGLISH: 'English'}
        };
        stubs['./options/browser'] = {
            options: {PHANTOMJS: '__PHANTOMJS__'}
        };
        stubs.nightwatch = {
            runner: sinon.stub()
        };
        stubs['glob-all'] = {
            sync: sinon.stub().returns([])
        };
        stubs.rimraf = {
            sync: sinon.stub()
        };
        stubs.deferResolve = sinon.stub();
        stubs.deferReject = sinon.stub();
        stubs.q = {
            defer: sinon.stub().returns({
                resolve: stubs.deferResolve,
                reject: stubs.deferReject
            })
        };
        stubs['./paths'] = {
            NADDA: '/',
            PROJ: '/'
        };
        testee = proxyquire('../../../lib/nadda', stubs);
    });

    it('calls processOptions with passed in options', function () {
        var options = {
            features: 'path/to/features',
            steps: 'path/to/steps',
            tags: [[]]
        };
        testee(options);
        assert.equal(stubs['./utils/process-options'].callCount, 1);
        assert.deepEqual(stubs['./utils/process-options'].args[0][0], options);
    });

    it('creates sandbox and sandbox/features', function () {
        testee();
        assert.equal(stubs.mkdirp.sync.callCount, 1);
        assert.equal(stubs.mkdirp.sync.args[0][0], '/sandbox/features');
    });

    it('def.reject called if mkdirp fails', function () {
        stubs.mkdirp.sync.throws({
            code: 'PROPER_FAIL'
        });
        testee();
        assert.equal(stubs.deferReject.callCount, 1);
    });

    it('def.reject not called if mkdirp fails due to EEXIST', function () {
        stubs.mkdirp.sync.throws({
            code: 'EEXIST'
        });
        testee();
        assert.equal(stubs.deferReject.callCount, 0);
    });

    it('calls writeSettingsFile with correct args to set up nightwatch.json file', function () {
        testee({
            config: 'ext-nw.json'
        });
        assert.equal(stubs['./utils/merge-settings-file'].callCount, 1);
        assert.equal(stubs['./utils/merge-settings-file'].args[0][0], 'ext-nw.json');
    });

    it('calls copyFileWithReplacements to copy steps-lib over with correct replacement', function () {
        var options = {
            steps: 'path/to/steps/**',
            localisation: null
        };
        testee(options);
        assert.equal(stubs['./utils/copy-file-with-replacements'].args[0][0], '/templates/steps-lib-template.txt');
        assert.equal(stubs['./utils/copy-file-with-replacements'].args[0][1], '/sandbox/steps-lib.js');
        assert.deepEqual(stubs['./utils/copy-file-with-replacements'].args[0][2], {
            '{steps_location}': JSON.stringify(options.steps),
            '{localisation}': options.localisation,
            '{nadda_path}': stubs['./paths'].NADDA
        });
    });

    it('should call mkdirp to create folder structure for each feature', function () {
        var features = {
                'a/path/to/feature1.feature' : 'feature1',
                'a/path/feature2.feature': 'feature2',
                'another/path/to/a-whole-other-feature.feature': 'a-whole-other-feature',
                'all/the/features-are-all-here.what.feature': 'features-are-all-here'
            },
            featuresArray = [];
        for (var f in features) {
            if (features.hasOwnProperty(f)) {
                featuresArray.push(f);
            }
        }

        stubs['glob-all'].sync.returns(featuresArray);
        testee({
            features: 'path/to/features/**'
        });
        featuresArray.forEach(function (feature, idx) {
            assert.equal(stubs.mkdirp.sync.args[idx + 1][0], path.resolve('/sandbox/features', path.dirname(feature)));
        });
    });

    it('should call copyFileWithReplacements to mirror each feature wrapped in feature-wrapper with correct replacement', function () {
        var features = {
                'a/path/to/feature1.feature' : 'feature1',
                'a/path/feature2.feature': 'feature2',
                'another/path/to/a-whole-other-feature.feature': 'a-whole-other-feature',
                'all/the/features-are-all-here.what.feature': 'features-are-all-here'
            },
            featuresArray = [],
            options = {
                features: 'path/to/steps/**',
                tags: [['~@wip'], ['@nope']]
            };
        for (var f in features) {
            if (features.hasOwnProperty(f)) {
                featuresArray.push(f);
            }
        }

        stubs['glob-all'].sync.returns(featuresArray);
        testee(options);
        featuresArray.forEach(function (feature, idx) {
            assert.equal(stubs['./utils/copy-file-with-replacements'].args[idx + 1][0], '/templates/feature-wrapper-template.txt');
            assert.equal(stubs['./utils/copy-file-with-replacements'].args[idx + 1][1], path.resolve('/sandbox/features/', path.dirname(feature),  features[feature] + '.js'));
            assert.deepEqual(stubs['./utils/copy-file-with-replacements'].args[idx + 1][2], {
                '{feature_location}': path.resolve(stubs['./paths'].PROJ, feature),
                '{nadda_path}': stubs['./paths'].NADDA,
                '{tag_rules}': JSON.stringify(options.tags)
            });
        });
    });

    describe('nightwatch runner', function () {
        var options = {
            config: '/sandbox/nightwatch.json',
            env: '__PHANTOMJS__'
        };
        beforeEach(function () {
            testee(options);
        });

        it('should call with correct config', function () {
            assert.equal(stubs.nightwatch.runner.callCount, 1);
            assert.deepEqual(stubs.nightwatch.runner.args[0][0], {
                config: options.config,
                env: options.env
            });
            assert.deepEqual(stubs.nightwatch.runner.args[0][2], {});
        });

        describe('done callback', function () {

            beforeEach(function () {
                stubs.nightwatch.runner.args[0][1]();
            });

            it('should call rimraf.sync to clear out sandbox folder', function () {
                assert.equal(stubs.rimraf.sync.callCount, 1);
                assert.equal(stubs.rimraf.sync.args[0][0], '/sandbox');
            });

            it('should call done callback', function () {
                assert.equal(stubs.deferResolve.callCount, 1);
            });
        });

    });

    describe('LOCALISATIONS', function () {
        it('should have localisation options available', function () {
            assert.deepEqual(testee.LOCALISATIONS, stubs['./options/localisation'].options);
        });
    });

    describe('BROWSERS', function () {
        it('should have browser options available', function () {
            assert.deepEqual(testee.BROWSERS, stubs['./options/browser'].options);
        });
    });

});
