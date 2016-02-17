'use strict';

var Yadda = require('yadda'),
    path = require('path'),
    glob = require('glob-all');

function createStepsLib(filePatterns, localisation) {
    var lib = localisation ? Yadda.localisation[localisation].library() : new Yadda.Library();
    lib.define('close_browser', function () {
        this.browser.end();
    });

    glob.sync(filePatterns).forEach(function (fileName) {
      console.log('steps', fileName, path.resolve(fileName));  
      require(path.resolve(fileName))(lib);
    });
    return new Yadda.Yadda(lib);
}

module.exports = createStepsLib;
