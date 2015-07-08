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
        for (var browser in settings.test_settings) {
            if (settings.test_settings.hasOwnProperty(browser)) {
                assert.equal(testee[browser.toUpperCase()], browser);
            }
        }
    });
});
