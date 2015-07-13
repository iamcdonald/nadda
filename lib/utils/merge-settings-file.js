var PATHS = require('../paths'),
    fs = require('fs'),
    path = require('path'),
    objectMerge = require('object-merge'),
    defaultSettings = require('../nightwatch-default.json');


function mergeSettingsToFile (externalSettings) {
    if (externalSettings) {
        try {
            var extSettings = require(path.resolve(PATHS.PROJ_PATH, externalSettings));
            defaultSettings = objectMerge(defaultSettings, extSettings);
        } catch (e) {
            console.log(e.message);
        }
    }
    defaultSettings.src_folders = path.resolve(PATHS.NY_PATH, 'sandbox/features');
    fs.writeFileSync(path.resolve(PATHS.NY_PATH, 'sandbox/nightwatch.json'), JSON.stringify(defaultSettings), 'UTF-8');
}

module.exports = mergeSettingsToFile;
