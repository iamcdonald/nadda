/* global describe, it, beforeEach */

'use strict';

var assert = require('assert'),
    OptionsList = require('../../../../lib/options/options-list');

describe('options/localisation', function () {

    var list,
        testee;
    beforeEach(function () {
        list = [1, 2, 3, 4];
        testee = new OptionsList(list, function (item) {
            return 'x' + item;
        });
    });

    describe('constructor', function () {

        it('create options map', function () {
            list.forEach(function (i) {
                assert.equal(testee.options['x' + i], i);
            });
        });

        it('adds passed list to _list', function () {
            assert.deepEqual(testee._list, list);
        });

    });

    describe('getValue', function () {

        it('returns the decoded value if val is a key in option map', function () {
            assert.equal(testee.getValue('x1'), 1);
        });

        it('returns the passed in value if val is in the list', function () {
            assert.equal(testee.getValue(1), 1);
        });

        it('returns null if val in neither the options map or list', function () {
            assert.deepEqual(testee.getValue('y'), null);
        });
    });

    describe('isValid', function () {
        it('returns true if option is in map', function () {
            assert.equal(testee.isValid('x3'), true);
        });

        it('returns true if option is in list', function () {
            assert.equal(testee.isValid(4), true);
        });

        it('returns false if option is not in list or map', function () {
            assert.equal(testee.isValid(40), false);
        });

        it('returns false if option is null', function () {
            assert.equal(testee.isValid(null), false);
        });
    });




});
