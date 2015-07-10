var OptionsList = require('./options-list'),
    settings = require('../nightwatch-default.json');

module.exports = new OptionsList(Object.keys(settings.test_settings), function (browser) {
                    return browser.slice(2, browser.length - 2).toUpperCase();
                });
