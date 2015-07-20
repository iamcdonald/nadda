'use strict';

var PATHS = require('../paths'),
    fs = require('fs'),
    path = require('path'),
    objectMerge = require('object-merge'),
    defaultSettings = require('../nightwatch-default.json');


function mergeSettingsToFile (externalSettings) {
    if (externalSettings) {
        try {
            var extSettings = require(path.resolve(PATHS.PROJ, externalSettings));
            defaultSettings = objectMerge(defaultSettings, extSettings);
        } catch (e) {
            console.log(e.message);
        }
    }
    /*jshint camelcase:false */
    defaultSettings.src_folders = path.resolve(PATHS.NADDA, 'sandbox/features');
    /*jshint camelcase:true */
    fs.writeFileSync(path.resolve(PATHS.NADDA, 'sandbox/nightwatch.json'), JSON.stringify(defaultSettings), 'UTF-8');
}

module.exports = mergeSettingsToFile;
