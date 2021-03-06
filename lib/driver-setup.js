'use strict';

var paths = require('./paths'),
    glob = require('glob-all'),
    fs = require('fs'),
    path = require('path'),
    defaultSettings = require('./nightwatch-default-template.json'),
    isWin = (process.platform === 'win32');


var sel = glob.sync(path.resolve(paths.NADDA, '../node_modules/selenium-standalone-jar/bin/*.jar'));
/*jshint camelcase:false */
defaultSettings.selenium.server_path = sel.length ? sel[0] : '';
defaultSettings.selenium.cli_args['webdriver.chrome.driver'] = path.resolve(paths.NADDA, '../node_modules/chromedriver/bin/chromedriver');
defaultSettings.test_settings.__PHANTOMJS__.desiredCapabilities['phantomjs.binary.path'] = path.resolve(paths.NADDA, '../node_modules/phantomjs-prebuilt/bin/phantomjs');
if (isWin) {
    defaultSettings.selenium.cli_args['webdriver.chrome.driver'] = path.resolve(paths.NADDA, '../node_modules/chromedriver/lib/chromedriver/chromedriver.exe');
    defaultSettings.test_settings.__PHANTOMJS__.desiredCapabilities['phantomjs.binary.path'] = path.resolve(paths.NADDA, '../node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs.exe');
    defaultSettings.selenium.cli_args['webdriver.ie.driver'] = path.resolve(paths.NADDA, '../node_modules/iedriver/lib/iedriver/IEDriverServer.exe');
} else {
    delete defaultSettings.test_settings.__IE__;
    console.log('Skipping iedriver install as it is useless on ' + process.platform + ' platform.');
}
/*jshint camelcase:true */

fs.writeFileSync(path.resolve(paths.NADDA, 'nightwatch-default.json'), JSON.stringify(defaultSettings), 'UTF-8');
process.exit(isWin);
