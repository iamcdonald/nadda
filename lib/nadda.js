var PATHS = require('./paths'),
	LOCALISATIONS = require('./options/localisation'),
	BROWSERS = require('./options/browser'),
	glob = require('glob-all'),
	fs = require('fs'),
	mkdirp = require('mkdirp'),
	q = require('q'),
	path = require('path'),
	rimraf = require('rimraf'),
	Nightwatch = require('nightwatch'),
    mergeSettingsFile = require('./utils/merge-settings-file'),
    copyFileWithReplacements = require('./utils/copy-file-with-replacements'),
	processOptions = require('./utils/process-options');

function nadda (options) {
	var def = q.defer();

	try {
		//process options
		options = processOptions(options);

		//create sandbox skeleton folder structure
		try {
			mkdirp.sync(path.resolve(PATHS.NY_PATH, 'sandbox/features'));
		} catch (e) {
			console.log(e);
			if (e.code !== 'EEXIST') {
				throw e;
			}
		}

		//nightwatch settings (merge internal defaults and external)
		mergeSettingsFile(options.config);

	    //write step lib wrapper
	    copyFileWithReplacements(path.resolve(PATHS.NY_PATH, 'templates/steps-lib-template.txt'),
	                            path.resolve(PATHS.NY_PATH, 'sandbox/steps-lib.js'),
	                            {
									'{steps_location}': JSON.stringify(options.steps),
									'{localisation}' : options.localisation
								});

	    //write wrapper for each test
	    var featureTitle;
	    glob.sync(options.features).forEach(function (featureFile) {
	        featureTitle = path.basename(featureFile).replace(/\..*/, '');
			mkdirp.sync(path.resolve(PATHS.NY_PATH, 'sandbox/features', path.dirname(featureFile)));
	        copyFileWithReplacements(path.resolve(PATHS.NY_PATH, 'templates/feature-wrapper-template.txt'),
	                                path.resolve(PATHS.NY_PATH, 'sandbox/features', path.dirname(featureFile), featureTitle + '.js'),
	                                {
										'{feature_location}': path.resolve(PATHS.PROJ_PATH, featureFile),
										'{ny_path}': PATHS.NY_PATH
									});
	    });

		//Run nightwatch
		Nightwatch.runner({
			config : path.resolve(PATHS.NY_PATH, 'sandbox/nightwatch.json'),
			env : options.env
		}, function () {
			rimraf.sync(path.resolve(PATHS.NY_PATH, 'sandbox'));
			def.resolve();
		}, {});

	} catch (e) {
		def.reject();
		console.log('ERROR:', e);
	}

	return def.promise;
}

nadda.LOCALISATIONS = LOCALISATIONS.options;
nadda.BROWSERS = BROWSERS.options;

module.exports = nadda;
