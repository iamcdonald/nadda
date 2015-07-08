var glob = require('glob-all'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	q = require('q'),
	path = require('path'),
	rimraf = require('rimraf'),
	objectMerge = require('object-merge'),
	Nightwatch = require('nightwatch'),
    mergeSettingsToFile = require('./merge-settings-to-file'),
    copyFileWithReplacements = require('./copy-file-with-replacements');

module.exports = function (options) {
	var def = q.defer();

	try {
		options = typeof options === 'object' ? options : {};
		options = objectMerge({
			features: '**/*.feature',
			steps: '**/*.steps.js',
			settings: null,
			tags: [],
			localisation: null,
			env: 'PHANTOMJS'
		}, options);

		if (options.localisation !== null) {
			options.localisation = JSON.stringify(options.localisation);
		}

		try {
			mkdirp.sync(path.resolve(__dirname, 'sandbox/features'));
		} catch (e) {
			if (e.code !== 'EEXIST') {
				throw e;
			}
		}
		//nightwatch settings (merge internal defaults and external)
		mergeSettingsToFile(path.resolve(__dirname, 'nightwatch-default.json'),
	                        options.settings,
	                        path.resolve(__dirname, 'sandbox/nightwatch.json'));

	    //write step lib wrapper
	    copyFileWithReplacements(path.resolve(__dirname, 'templates/yadda-lib-template.txt'),
	                            path.resolve(__dirname, 'sandbox/yadda-lib.js'),
	                            {
									'{steps_location}': JSON.stringify(options.steps),
									'{localisation}' : options.localisation
								});

	    //write wrapper for each test
	    var featureTitle;
	    glob.sync(options.features).forEach(function (featureFile) {
	        featureTitle = path.basename(featureFile).replace(/\..*/, '');
			mkdirp.sync(path.resolve('lib/sandbox/features', path.dirname(featureFile)));
	        copyFileWithReplacements(path.resolve(__dirname, 'templates/nightwatch-yadda-wrapper-template.txt'),
	                                path.resolve(__dirname, 'sandbox/features', path.dirname(featureFile), featureTitle + '.js'),
	                                {
										'{feature_location}': path.resolve(featureFile)
									});
	    });
		Nightwatch.runner({
			config : path.resolve('lib/sandbox/nightwatch.json'),
			env : options.env
		}, function () {
			rimraf.sync(path.resolve(__dirname, 'sandbox'));
			def.resolve();
		}, {});

	} catch (e) {
		def.reject();
		console.log('ERROR:', e);
	}

	return def.promise;
};
