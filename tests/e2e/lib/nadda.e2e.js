/* global describe, it, beforeEach, afterEach, before, after */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    glob = require('glob-all'),
    sinon = require('sinon'),
    processExitStub,
    nightwatchYadda;


describe('nadda e2e', function () {

    before(function () {
        processExitStub = sinon.stub(process, 'exit');
        require('../../../lib/driver-setup');
        nightwatchYadda = require('../../../lib/nadda');
    });

    after(function () {
        fs.unlinkSync('lib/nightwatch-default.json');
        processExitStub.restore();
    });

    it('should run the features correctly', function (done) {
        this.timeout(100000);
        function callback() {
            assert.equal(glob.sync('tests/e2e/reports/**/*.xml').length, 1);
            rimraf.sync(path.resolve('tests/e2e/reports'));
            done();
        }

        assert.doesNotThrow(function () {
            nightwatchYadda({
                features: 'tests/e2e/lib/fixture/**/*.feature',
                steps: 'tests/e2e/lib/fixture/**/*.steps.js',
                localisation: nightwatchYadda.LOCALISATIONS.ENGLISH,
                config: 'tests/e2e/lib/fixture/nightwatch.json',
                env: nightwatchYadda.BROWSERS.PHANTOMJS
            }).finally(function () {
                assert.equal(glob.sync('tests/e2e/lib/reports/**/*.xml').length, 1);
                rimraf.sync(path.resolve('tests/e2e/lib/reports'));
                done();
            });
        });
    });

});