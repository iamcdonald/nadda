/* global describe, it, beforeEach, afterEach */

'use strict';

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    glob = require('glob-all'),
    nightwatchYadda = require('../../lib/nightwatch-yadda');

describe('nightwatch-yadda e2e', function () {


    it('should run the features correctly', function (done) {

        function callback() {
            console.log('DONE');
            assert.equal(glob.sync('tests/e2e/reports/**/*.xml').length, 1);
            rimraf.sync(path.resolve('tests/e2e/reports'));
            done();
        }

        this.timeout(100000);
        assert.doesNotThrow(function () {
            nightwatchYadda({
                features: 'tests/e2e/fixture/**/*.feature',
                steps: 'tests/e2e/fixture/**/*.steps.js',
                localisation: 'English',
                settings: 'tests/e2e/fixture/nightwatch.json',
                env: 'PHANTOMJS'
            }).finally(function () {
                console.log('DONE');
                assert.equal(glob.sync('tests/e2e/reports/**/*.xml').length, 1);

                rimraf.sync(path.resolve('tests/e2e/reports'));
                done();
            });
        });
    });

});
