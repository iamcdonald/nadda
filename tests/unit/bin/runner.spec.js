/* global describe, it, beforeEach, xit */

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    path = require('path'),
    sinon = require('sinon');

describe('runner', function () {

    var testee,
        stubs = {};
    function createTestee(argv) {

        process.argv = argv || {};
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
        stubs.yargs = {};
        stubs.yargs.alias = sinon.stub().returns(stubs.yargs);
        stubs.yargs.version = sinon.stub().returns(stubs.yargs);
        stubs.yargs.describe = sinon.stub().returns(stubs.yargs);
        stubs.yargs.options = sinon.stub().returns(stubs.yargs);
        stubs.yargs.help = sinon.stub().returns(stubs.yargs);
        stubs.yargs.usage = sinon.stub().returns(stubs.yargs);
        stubs.yargs.showHelpOnFail = sinon.stub().returns(stubs.yargs);
        stubs.yargs.argv = process.argv;
        testee = proxyquire('../../../bin/runner', stubs);
    }

    describe('yargs config', function () {

        beforeEach(function () {
            createTestee();
        });

        it('alias\' v to version', function () {
            assert.equal(stubs.yargs.alias.args[0][0], 'v');
            assert.equal(stubs.yargs.alias.args[0][1], 'version');
        });

        it('provides version function', function () {
            assert.equal(typeof stubs.yargs.version.args[0][0], 'function');
            assert.equal(stubs.yargs.version.args[0][0](), require('../../../package.json').version);
        });

        it('adds description of v/version command', function () {
            assert.equal(stubs.yargs.describe.args[0][0], 'v');
            assert.equal(stubs.yargs.describe.args[0][1], 'show version information');
        });

        it('adds f/features command', function () {
            var featuresCommand = stubs.yargs.options.args[0][0].f;
            assert.equal(featuresCommand.alias, 'features');
            assert.equal(featuresCommand.describe, 'globs to select feature files');
            assert.equal(featuresCommand.type, 'array');
        });

        it('adds s/steps command', function () {
            var featuresCommand = stubs.yargs.options.args[0][0].s;
            assert.equal(featuresCommand.alias, 'steps');
            assert.equal(featuresCommand.describe, 'globs to select steps files');
            assert.equal(featuresCommand.type, 'array');
        });

        it('adds l/localisation command', function () {
            var featuresCommand = stubs.yargs.options.args[0][0].l;
            assert.equal(featuresCommand.alias, 'localisation');
            assert.equal(featuresCommand.describe, 'selects the Yadda localisation library to pass ' +
                                                    'to step files\nAvailable Options -\nENGLISH | FRENCH');
            assert.equal(featuresCommand.type, 'string');
        });

        it('adds e/env command', function () {
            var featuresCommand = stubs.yargs.options.args[0][0].e;
            assert.equal(featuresCommand.alias, 'env');
            assert.equal(featuresCommand.describe, 'selects the browser environment to use\n' +
                                                    'Available Options -\n' +
                                                    'CHROME | PHANTOMJS' +
                                                    '\nor any other test_settings provided in passed in nightwatch.json');
            assert.equal(featuresCommand.type, 'string');
        });

        it('adds c/config command', function () {
            var featuresCommand = stubs.yargs.options.args[0][0].c;
            assert.equal(featuresCommand.alias, 'config');
            assert.equal(featuresCommand.describe, 'file path to local nightwatch.json if you' +
                                                    ' want to override/add to nightwatch config');
            assert.equal(featuresCommand.type, 'string');
        });

        it('adds t/tags command', function () {
            var featuresCommand = stubs.yargs.options.args[0][0].t;
            assert.equal(featuresCommand.alias, 'tags');
            assert.equal(featuresCommand.describe, 'tags to determine which scenarios to run\n' +
                                                '--tags ~@wip will run scenarios that don\'t have the @wip tag\n' +
                                                '--tags ~@wip,@feature will AND the tags (running scenarios that have the @feature tag AND do not have the @wip tag)\n' +
                                                '--tags ~@wip --tags @feature will OR the tags (running scenarios that have the @feature tag OR do not have the @wip tag)');
            assert.equal(featuresCommand.type, 'string');
        });

        it('alias\' h to help', function () {
            assert.equal(stubs.yargs.alias.args[1][0], 'h');
            assert.equal(stubs.yargs.alias.args[1][1], 'help');
        });

        it('sets help command to help', function () {
            assert.equal(stubs.yargs.help.args[0][0], 'help');
        });

        it('sets usage text', function () {
            assert.equal(stubs.yargs.usage.args[0][0], 'Usage: nightwatch-yadda [options]');
        });

        it('sets whether to show help on fail', function () {
            assert.equal(stubs.yargs.showHelpOnFail.args[0][0], false);
            assert.equal(stubs.yargs.showHelpOnFail.args[0][1], 'Specify --help for available options');
        });

    });

    it('calls nadda with correct options taken from argv', function () {
        var argv = {
                f: ['f/1/*', 'f/2/*', 'f/4/*'],
                s: ['steps/one/*.steps.js', 'steps/two/**/*.steps.js'],
                l: 'English',
                e: 'CHROME',
                c: 'path/to/config.json',
                t: ['@wip,@feature', '@done']
            },
            options;
        createTestee(argv);
        options = stubs['../lib/nadda'].args[0][0];
        assert.deepEqual(options.features, argv.f);
        assert.deepEqual(options.steps, argv.s);
        assert.equal(options.localisation, argv.l);
        assert.equal(options.env, argv.e);
        assert.equal(options.config, argv.c);
        assert.deepEqual(options.tags, [['@wip', '@feature'], ['@done']]);
    });

    it('calls nadda with correct options taken from argv - single tag', function () {
        var argv = {
                f: ['f/1/*', 'f/2/*', 'f/4/*'],
                s: ['steps/one/*.steps.js', 'steps/two/**/*.steps.js'],
                l: 'English',
                e: 'CHROME',
                c: 'path/to/config.json',
                t: '@wip'
            },
            options;
        createTestee(argv);
        options = stubs['../lib/nadda'].args[0][0];
        assert.deepEqual(options.features, argv.f);
        assert.deepEqual(options.steps, argv.s);
        assert.equal(options.localisation, argv.l);
        assert.equal(options.env, argv.e);
        assert.equal(options.config, argv.c);
        assert.deepEqual(options.tags, [['@wip']]);
    });


});
