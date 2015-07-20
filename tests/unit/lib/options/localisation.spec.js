/* global describe, it, beforeEach */

'use strict';

var assert = require('assert'),
    yadda = require('yadda');

describe('options/localisation', function () {
    var testee;
    beforeEach(function () {
        testee = require('../../../../lib/options/localisation');
    });

    it('should have all yadda localisation values', function () {
        var hasOptions = false;
        for (var localisation in testee.options) {
            if (testee.options.hasOwnProperty(localisation)) {
                hasOptions = true;
                assert(yadda.localisation[testee.options[localisation]]);
            }
        }
        assert(hasOptions);
    });
});
