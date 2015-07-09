/* global describe, it, beforeEach */

'use strict';

var assert = require('assert'),
    settings = require('../../../../lib/nightwatch-default.json');

describe('options/browser', function () {
    var testee;
    beforeEach(function () {
        testee = require('../../../../lib/options/browser');
    });

    it('should have all browser environment values', function () {
        var hasOptions = false;
        for (var browser in testee) {
            if (testee.hasOwnProperty(browser)) {
                hasOptions = true;
                assert(settings.test_settings[testee[browser]]);
            }
        }
        assert(hasOptions);
    });
});
