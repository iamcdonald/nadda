'use strict';

var OptionsList = require('./options-list'),
    yadda = require('yadda');

module.exports = new OptionsList(Object.keys(yadda.localisation), function (localisation) {
                    return localisation.toUpperCase();
                });
