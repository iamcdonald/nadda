var nightwatchYadda = require('../lib/nightwatch-yadda'),
    argv = require('yargs')
            //version
            .alias('v', 'version')
            .version(function() { return require('../package').version; })
            .describe('v', 'show version information')

            //options
            .options({
                f: {
                    alias: 'features',
                    describe: 'globs to select feature files',
                    type: 'array'
                },
                s: {
                    alias: 'steps',
                    describe: 'globs to select steps files',
                    type: 'array'
                },
                l: {
                    alias: 'localisation',
                    describe: 'selects the Yadda localisation library to pass ' +
                                'to step files\nAvailable Options -\n' +
                                Object.keys(nightwatchYadda.LOCALISATIONS).join(' | '),
                    type: 'string'
                },
                e: {
                    alias: 'env',
                    describe: 'selects the browser environment to use\n' +
                                'Available Options -\n' +
                                Object.keys(nightwatchYadda.BROWSERS).join(' | ') +
                                '\nor any other test_settings provided in passed in nightwatch.json',
                    type: 'string'
                },
                c: {
                    alias: 'config',
                    describe: 'file path to local nightwatch.json if you want to override/add to nightwatch config',
                    type: 'string'
                }
            })


            // help text
            .alias('h', 'help')
            .help('help')
            .usage('Usage: nightwatch-yadda [options]')
            .showHelpOnFail(false, 'Specify --help for available options')

            .argv,
    options = {};

if (argv.f) {
    options.features = argv.f;
}
if (argv.s) {
    options.steps = argv.s;
}
if (argv.l) {
    options.localisation = argv.l;
}
if (argv.e) {
    options.env = argv.e;
}
if (argv.c) {
    options.config = argv.c;
}

nightwatchYadda(options);
