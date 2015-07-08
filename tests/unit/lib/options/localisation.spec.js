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
        for (var l in yadda.localisation) {
            if (yadda.localisation.hasOwnProperty(l)) {
                assert.equal(testee[l.toUpperCase()], l);
            }
        }
    });
});
