'use strict';

var fs = require('fs'),
	path = require('path'),
	Yadda = require('yadda'),
    PATHS = require('../paths'),
	yaddaInstance = require(path.resolve(PATHS.NADDA, 'sandbox/steps-lib')),
	shouldRunScenario = require(path.resolve(PATHS.NADDA, 'utils/should-run-scenario')),
	featureParser = new Yadda.parsers.FeatureParser();

function getScenarioTags (scenario) {
	var tags = Object.keys(scenario.annotations) || [];
	return tags.map(function (tag) {
				return '@' + tag;
			});
}

function createScenarioFunc(scenario, tagRules) {
	return function (browser) {
		if (!shouldRunScenario(tagRules, getScenarioTags(scenario))) {
			console.log('Not running scenario due to tag rules supplied');
			browser.end();
			return;
		}
		scenario.steps.push('close_browser');
		scenario.steps.forEach(function (step) {
			if (step !== 'close_browser') {
				browser.perform(function () {
					console.log('- ', step);
				});
			}
			yaddaInstance.yadda([step], {browser: browser});
		});
	};
}

function decodeFeature(featurePath, tagRules) {
    var feature = featureParser.parse(fs.readFileSync(featurePath, 'UTF-8')),
        decoded = {},
		scenario;
	if(feature.title || (feature.description && feature.description.length)) {
		decoded['--Feature--'] = function (browser) {
			browser.perform(function () {
				if (feature.title) {
					console.log(feature.title);
				}
				if (feature.description) {
					console.log(feature.description.join('\n'));
				}
			});
		};
	}

    for (var j = 0, sl = feature.scenarios.length; j < sl; j++) {
    	scenario = feature.scenarios[j];
    	decoded[scenario.title] = createScenarioFunc(scenario, tagRules);
    }
    return decoded;
}

module.exports = decodeFeature;
