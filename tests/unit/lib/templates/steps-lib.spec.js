/* global before, after, afterEach, describe, it, beforeEach */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    copyFileWithReplacements = require('../../../../lib/utils/copy-file-with-replacements'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon');

describe('templates/steps-lib', function () {

    var testee,
        stubs = {},
        stepsFilePatterns = ['steps/**/*.steps.js', '**/*.js'],
        localisation = 'English',
        NADDA = '/';

    before(function () {
        fs.mkdirSync(path.resolve(__dirname, 'sandbox'));
        copyFileWithReplacements(path.resolve(__dirname, '../../../../lib/templates/steps-lib-template.txt'),
                                path.resolve(__dirname, 'sandbox/steps-lib.js'),
                                {
                                    '{nadda_path}': NADDA,
                                    '{steps_location}': JSON.stringify(stepsFilePatterns),
                                    '{localisation}': JSON.stringify(localisation)
                                });
    });

    after(function () {
        rimraf.sync(path.resolve(__dirname, 'sandbox'));
    });

    beforeEach(function () {
        stubs['/utils/create-steps-lib'] = sinon.stub().returns('value');
        testee = proxyquire('./sandbox/steps-lib', stubs);
    });

    it('should call create-steps-lib with correct params', function () {
        assert.equal(testee, 'value');
        assert.equal(stubs['/utils/create-steps-lib'].callCount, 1);
        assert.deepEqual(stubs['/utils/create-steps-lib'].args[0][0], stepsFilePatterns);
        assert.deepEqual(stubs['/utils/create-steps-lib'].args[0][1], localisation);
    });

});
