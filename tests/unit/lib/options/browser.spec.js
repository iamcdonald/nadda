/* global describe, it, beforeEach */

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    settings = require('../../../../lib/nightwatch-default-template.json');

describe('options/browser', function () {
    var testee;
    beforeEach(function () {
        testee = proxyquire('../../../../lib/options/browser', {
            '../nightwatch-default.json': settings
        });
    });

    it('should have all browser environment values', function () {
        var hasOptions = false;
        for (var browser in testee.options) {
            if (testee.options.hasOwnProperty(browser)) {
                hasOptions = true;
                assert(settings.test_settings[testee.options[browser]]);
            }
        }
        assert(hasOptions);
    });
});
