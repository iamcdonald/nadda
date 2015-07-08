/* global describe, it, beforeEach */

'use strict';

var assert = require('assert'),
    proxyquire = require('proxyquire'),
    path = require('path'),
    sinon = require('sinon'),
    objectMerge = require('object-merge');

describe('nightwatch-yadda', function () {

    var testee,
        stubs = {},
        spies = {};

    stubs['object-merge'] = sinon.spy(objectMerge);
    beforeEach(function () {
        stubs.mkdirp = {
            sync: sinon.stub()
        };
        stubs['./utils/write-settings-file'] = sinon.stub();
        stubs['./utils/copy-file-with-replacements'] = sinon.stub();
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
        stubs.q = {
            defer: sinon.stub().returns({
                resolve: stubs.deferResolve
            })
        };
        testee = proxyquire('../../../lib/nightwatch-yadda', stubs);
    });

    it('should merges default and passed in options', function () {
        var options = {
            features: 'path/to/features',
            steps: 'path/to/steps',
            tags: ['some', 'tags']
        };
        testee(options);
        assert.equal(stubs['object-merge'].callCount, 1);
        assert.equal(stubs['object-merge'].args[0][0].features, '**/*.feature');
        assert.equal(stubs['object-merge'].args[0][0].steps, '**/*.steps.js');
        assert.deepEqual(stubs['object-merge'].args[0][0].tags, []);
        assert.equal(stubs['object-merge'].args[0][1].features, options.features);
        assert.equal(stubs['object-merge'].args[0][1].steps, options.steps);
        assert.deepEqual(stubs['object-merge'].args[0][1].tags, options.tags);
    });

    it('creates sandbox and sandbox/features', function () {
        testee();
        assert.equal(stubs.mkdirp.sync.callCount, 1);
        assert.equal(stubs.mkdirp.sync.args[0][0], path.resolve(__dirname, '../../../lib/sandbox/features'));
    });

    it('calls mergeSettingsToFile with correct args to set up nightwatch.json file', function () {
        testee({
            settings: 'ext-nw.json'
        });
        assert.equal(stubs['./utils/write-settings-file'].callCount, 1);
        assert.equal(stubs['./utils/write-settings-file'].args[0][0], path.resolve(__dirname, '../../../lib/nightwatch-default.json'));
        assert.equal(stubs['./utils/write-settings-file'].args[0][1], 'ext-nw.json');
        assert.equal(stubs['./utils/write-settings-file'].args[0][2], path.resolve(__dirname, '../../../lib/sandbox/nightwatch.json'));
    });

    it('should call copyFileWithReplacements to copy steps-lib over with correct replacement', function () {
        testee({
            steps: 'path/to/steps/**'
        });
        assert.equal(stubs['./utils/copy-file-with-replacements'].args[0][0], path.resolve(__dirname, '../../../lib/templates/yadda-lib-template.txt'));
        assert.equal(stubs['./utils/copy-file-with-replacements'].args[0][1], path.resolve(__dirname, '../../../lib/sandbox/yadda-lib.js'));
        assert.deepEqual(stubs['./utils/copy-file-with-replacements'].args[0][2], {
            '{steps_location}': JSON.stringify('path/to/steps/**'),
            '{localisation}': null
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
            assert.equal(stubs.mkdirp.sync.args[idx + 1][0], path.resolve('lib/sandbox/features', path.dirname(feature)));
        });
    });

    it('should call copyFileWithReplacements to mirror each feature wrapped in nightwatch-yadda-wrapper with correct replacement', function () {
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
            features: 'path/to/steps/**'
        });
        featuresArray.forEach(function (feature, idx) {
            assert.equal(stubs['./utils/copy-file-with-replacements'].args[idx + 1][0], path.resolve(__dirname, '../../../lib/templates/nightwatch-yadda-wrapper-template.txt'));
            assert.equal(stubs['./utils/copy-file-with-replacements'].args[idx + 1][1], path.resolve('lib/sandbox/features/', path.dirname(feature),  features[feature] + '.js'));
            assert.deepEqual(stubs['./utils/copy-file-with-replacements'].args[idx + 1][2], {
                '{feature_location}': path.resolve(feature)
            });
        });
    });

    describe('nightwatch runner', function () {

        beforeEach(function () {
            testee({});
        });

        it('should call with correct config', function () {
            assert.equal(stubs.nightwatch.runner.callCount, 1);
            assert.deepEqual(stubs.nightwatch.runner.args[0][0], {
                config: path.resolve(__dirname, '../../../lib/sandbox/nightwatch.json'),
                env: 'PHANTOMJS'
            });
            assert.deepEqual(stubs.nightwatch.runner.args[0][2], {});
        });

        describe('done callback', function () {

            beforeEach(function () {
                stubs.nightwatch.runner.args[0][1]();
            });

            it('should call rimraf.sync to clear out sandbox folder', function () {
                assert.equal(stubs.rimraf.sync.callCount, 1);
                assert.equal(stubs.rimraf.sync.args[0][0], path.resolve(__dirname, '../../../lib/sandbox'));
            });

            it('should call done callback', function () {
                assert.equal(stubs.deferResolve.callCount, 1);
            });
        });

    });

});
