var fs = require('fs'),
    path = require('path'),
    glob = require('glob-all'),
    objectMerge = require('object-merge');

function getSeleniumPath () {
    var sel = glob.sync(path.resolve('node_modules/selenium-standalone-wrapper/*.jar'));
    if (sel.length) {
        return sel[0];
    }
    return '';
}

module.exports = function (defaultSettings, externalSettings, writeLocation) {
    nightwatchSettings = require(defaultSettings);
    nightwatchSettings.selenium.server_path = getSeleniumPath();
    nightwatchSettings.selenium.cli_args['webdriver.chrome.driver'] = path.resolve('node_modules/chromedriver/bin/chromedriver');
    nightwatchSettings.selenium.cli_args['webdriver.ie.driver'] = path.resolve('node_modules/iedriver/bin/iedriver');
    nightwatchSettings.test_settings.PHANTOMJS['phantomjs.binary.path'] = path.resolve('node_modules/phantomjs/bin/phantomjs');
    if (externalSettings) {
        try {
            var extSettings = require(path.resolve(externalSettings));
            nightwatchSettings = objectMerge(nightwatchSettings, extSettings);
        } catch (e) {
            console.log(e);
        }
    }
    nightwatchSettings.src_folders = path.resolve('lib/sandbox/features');
    fs.writeFileSync(writeLocation, JSON.stringify(nightwatchSettings), 'UTF-8');
};
