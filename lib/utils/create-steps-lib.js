'use strict';

var Yadda = require('yadda'),
    glob = require('glob-all');

function createStepsLib(filePatterns, localisation) {
    var lib = localisation ? Yadda.localisation[localisation].library() : new Yadda.Library();
    lib.define('close_browser', function () {
        this.browser.end();
    });

    glob.sync(filePatterns).forEach(function (fileName) {
        require(fileName)(lib);
    });
    return new Yadda.Yadda(lib);
}

module.exports = createStepsLib;
