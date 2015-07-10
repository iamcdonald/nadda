var objectMerge = require('object-merge'),
    LOCALISATIONS = require('../options/localisation'),
    BROWSERS = require('../options/browser'),
    PATHS = require('../paths');

function processOptions(options) {
	options = typeof options === 'object' ? options : {};
	options = objectMerge({
		features: '**/*.feature',
		steps: '**/*.steps.js',
		config: null,
		localisation: null,
		env: BROWSERS.options.PHANTOMJS
	}, options);

	if (options.localisation !== null && !LOCALISATIONS.isValid(options.localisation)) {
        throw new TypeError('Localisation value is invalid - ' + options.localisation);
	}
	options.localisation = LOCALISATIONS.getValue(options.localisation);
    if (options.localisation) {
        options.localisation = JSON.stringify(options.localisation);
    }

    options.env = BROWSERS.getValue(options.env) || options.env;

	return options;
}

module.exports = processOptions;
