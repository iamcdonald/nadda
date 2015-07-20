'use strict';

var OptionsList = require('./options-list'),
    settings = require('../nightwatch-default.json');

/*jshint camelcase:false */
module.exports = new OptionsList(Object.keys(settings.test_settings), function (browser) {
                    return browser.slice(2, browser.length - 2).toUpperCase();
                });
/*jshint camelcase:true */
