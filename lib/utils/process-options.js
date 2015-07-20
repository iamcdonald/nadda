var objectMerge = require('object-merge'),
    LOCALISATIONS = require('../options/localisation'),
    BROWSERS = require('../options/browser');

function processTags(tags) {
    if (!tags) {
        return [[]];
    }
    if (typeof tags === 'string') {
        return [[tags]];
    }
    if (Array.isArray(tags) && !tags.filter(function (tag) {return typeof tag !== 'string';}).length) {
        return [tags];
    }
    return tags;
}

function isArrayOfType(arr, type) {
    if (!Array.isArray(arr)) {
        return false;
    }

    for (var i = 0, l = arr.length; i < l; i++) {
        if (typeof arr[i] !== type) {
            return false;
        }
    }

    return true;
}

function tagsAreValid(tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
        if(!isArrayOfType(tags[i], 'string')) {
            return false;
        }
    }

    return true;
}

function processOptions(options) {
	options = typeof options === 'object' ? options : {};
	options = objectMerge({
		features: ['**/*.feature', '!node_modules/**/*'],
		steps: ['**/*.steps.js', '!node_modules/**/*'],
		config: null,
		localisation: null,
		env: BROWSERS.options.PHANTOMJS,
        tags: [],
	}, options);

	if (options.localisation !== null && !LOCALISATIONS.isValid(options.localisation)) {
        throw new TypeError('Localisation value is invalid - ' + options.localisation);
	}
	options.localisation = LOCALISATIONS.getValue(options.localisation);
    if (options.localisation) {
        options.localisation = JSON.stringify(options.localisation);
    }

    options.env = BROWSERS.getValue(options.env) || options.env;

    options.tags = processTags(options.tags);
    if(!tagsAreValid(options.tags)) {
        throw new TypeError('Tags should be 2d array of strings, format is invalid - ' + JSON.stringify(options.tags));
    }

	return options;
}

module.exports = processOptions;
