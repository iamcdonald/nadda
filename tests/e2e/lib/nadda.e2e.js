/* global describe, it, before, after */

'use strict';

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    execSync = require('child_process').execSync,
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

    function checkReport() {
      var report = glob.sync('tests/e2e/lib/reports/**/*.xml'),
        reportContent,
        re;
      assert.equal(report.length, 1);
      reportContent = fs.readFileSync(report[0], 'UTF-8');
      re = new RegExp(/testcase name="DuckDuckGo Search for nightwatch".+assertions="3"/);
      assert(reportContent.match(re));
      re = new RegExp(/testcase name="DuckDuckGo Search for bower".+assertions="3"/);
      assert(reportContent.match(re));
      re = new RegExp(/testcase name="DuckDuckGo Search for swift".+assertions="0"/);
      assert(reportContent.match(re));
      re = new RegExp(/testcase name="DuckDuckGo Search for js".+assertions="0"/);
      assert(reportContent.match(re));

    }

    it('should run the features correctly', function () {
        this.timeout(100000);

        return nightwatchYadda({
                features: 'tests/e2e/lib/fixture/**/*.feature',
                steps: 'tests/e2e/lib/fixture/**/*.steps.js',
                localisation: nightwatchYadda.LOCALISATIONS.ENGLISH,
                config: 'tests/e2e/lib/fixture/nightwatch.json',
                env: nightwatchYadda.BROWSERS.PHANTOMJS,
                tags: ['~@wip']
            }).finally(function () {
                checkReport();
                rimraf.sync(path.resolve('tests/e2e/lib/reports'));
            });
    });

    it('should run the features correctly from cli', function (done) {
        this.timeout(2000000);
        var n = execSync('npm install . -g');
        n = execSync('nadda ' +
                  '-f \'tests/e2e/lib/fixture/**/*.feature\' ' +
                  '-s \'tests/e2e/lib/fixture/**/*.steps.js\' ' +
                  '-l ENGLISH ' +
                  '-c ./tests/e2e/lib/fixture/nightwatch.json ' +
                  '-e __PHANTOMJS__ ' +
                  '-t ~@wip');
        checkReport();
        rimraf.sync(path.resolve('tests/e2e/lib/reports'));
        n = execSync('npm uninstall . -g');
        done();
    });

});
