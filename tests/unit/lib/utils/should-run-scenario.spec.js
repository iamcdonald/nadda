/* global describe, it, beforeEach */

'use strict';

var assert = require('assert');

describe('utils/should-run-feature', function () {

    var testee,
        tagRules = [
            ['~@wip', '@awesome'],
            ['@winner'],
            ['@done', '@ace']
        ];

    beforeEach(function () {
        testee = require('../../../../lib/utils/should-run-scenario');
    });

    it('should interpret ~ as meaning scenario should not have the tag', function () {
        assert.equal(testee([['~@wip']], []), true);
        assert.equal(testee([['~@wip']], ['@wip']), false);
    });

    it('should interpret no ~ as meaning scenario should have the tag', function () {
        assert.equal(testee([['@wip']], []), false);
        assert.equal(testee([['@wip']], ['@wip']), true);
    });

    it('should return true if scenario tags match one of the tag rules - I', function () {
        var tags = ['@winner'];
        assert.equal(testee(tagRules, tags), true);
    });

    it('should return true if scenario tags match one of the tag rules - II', function () {
        var tags = ['@done', '@ace'];
        assert.equal(testee(tagRules, tags), true);
    });

    it('should return false if scenario tags do not match one of the tag rules - I', function () {
        var tags = ['@no-match'];
        assert.equal(testee(tagRules, tags), false);
    });

    it('should return false if scenario tags do not match one of the tag rules - II', function () {
        var tags = ['@wip', '@awesome'];
        assert.equal(testee(tagRules, tags), false);
    });
});
