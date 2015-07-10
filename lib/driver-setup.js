var NY_PATH = require('./paths').NY_PATH,
    glob = require('glob-all'),
    fs = require('fs'),
    path = require('path'),
    defaultSettings = require('./nightwatch-default-template.json'),
    isWin = (process.platform === 'win32');


var sel = glob.sync(path.resolve(NY_PATH, '../node_modules/selenium-standalone-wrapper/*.jar'));
defaultSettings.selenium.server_path = sel.length ? sel[0] : '';
defaultSettings.selenium.cli_args['webdriver.chrome.driver'] = path.resolve(NY_PATH, '../node_modules/chromedriver/bin/chromedriver');
defaultSettings.test_settings.__PHANTOMJS__.desiredCapabilities['phantomjs.binary.path'] = path.resolve(NY_PATH, '../node_modules/phantomjs/bin/phantomjs');
if (isWin) {
    defaultSettings.selenium.cli_args['webdriver.ie.driver'] = path.resolve(NY_PATH, '../node_modules/iedriver/bin/iedriver');
} else {
    delete defaultSettings.test_settings.__IE__;
    console.log('Skipping iedriver install as it is useless on ' + process.platform + ' platform.');
}

fs.writeFileSync(path.resolve(NY_PATH, 'nightwatch-default.json'), JSON.stringify(defaultSettings), 'UTF-8');
process.exit(isWin);