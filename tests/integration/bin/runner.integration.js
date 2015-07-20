/* global describe, it */

'use strict';

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon');

describe('runner', function () {

    var testee,
        stubs = {};
    function createTestee(argv) {

        process.argv = argv;
        stubs['../lib/nadda'] = sinon.stub();
        stubs['../lib/nadda'].LOCALISATIONS = {
            ENGLISH: 'English',
            FRENCH: 'French'
        };
        stubs['../lib/nadda'].BROWSERS = {
            CHROME: '__CHROME__',
            PHANTOMJS: '__PHANTOMJS__'
        };
        //fresh yargs instance for each test
        stubs.yargs = proxyquire('yargs', {});
        testee = proxyquire('../../../bin/runner', stubs);
    }

    it('should call nadda with correct parsed options - I', function () {
        var argv = ['node',
                    'command',
                    '-f', 'one/**/*.feature', 'two/**/*.feature', 'three/**/*.feature',
                    '-s', 'one/**/*.steps.js', 'two/*.steps.js',
                    '-c', 'path/to/config.json',
                    '-l', 'FRENCH',
                    '-e', 'CHROME',
                    '-t', '@wip,@feature',
                    '-t', '@done'];
        createTestee(argv);
        assert.equal(stubs['../lib/nadda'].callCount, 1);
        assert.deepEqual(stubs['../lib/nadda'].args[0][0], {
            features: argv.slice(3, 6),
            steps: argv.slice(7, 9),
            localisation: argv.slice(12, 13)[0],
            config: argv.slice(10, 11)[0],
            env: argv.slice(14, 15)[0],
            tags: [['@wip', '@feature'],['@done']]
        });
    });

    it('should call nadda with correct parsed options - II', function () {
        var argv = ['node',
                    'command',
                    '--features', 'c/**/*.feature', 'b/**/*.feature',
                    '--steps', 'a/b/**/*.steps.js', 'c/*.steps.js',
                    '--config', 'new/path/to/config.json',
                    '--localisation', 'RUSSIAN',
                    '--env', 'FIREFOX',
                    '--tags', '@feature'];
        createTestee(argv);
        assert.equal(stubs['../lib/nadda'].callCount, 1);
        assert.deepEqual(stubs['../lib/nadda'].args[0][0], {
            features: argv.slice(3, 5),
            steps: argv.slice(6, 8),
            localisation: argv.slice(11, 12)[0],
            config: argv.slice(9, 10)[0],
            env: argv.slice(13, 14)[0],
            tags: [['@feature']]
        });
    });
});
