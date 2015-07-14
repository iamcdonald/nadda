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
        NADDA = '/',
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
                                    '{nadda_path}': NADDA,
                                    '{tag_rules}': JSON.stringify(tagRules)
                                });
    });

    after(function () {
        rimraf.sync(path.resolve(__dirname, 'sandbox'));
    });

    beforeEach(function () {
        stubs['/utils/decode-feature'] = sinon.stub().returns('value');
        testee = proxyquire('./sandbox/feature-wrapper', stubs);
    });

    it('should call decode-feature with correct params', function () {
        assert.equal(testee, 'value');
        assert.equal(stubs['/utils/decode-feature'].callCount, 1);
        assert.equal(stubs['/utils/decode-feature'].args[0][0], featureFilePath);
        assert.deepEqual(stubs['/utils/decode-feature'].args[0][1], tagRules);
    });

});
