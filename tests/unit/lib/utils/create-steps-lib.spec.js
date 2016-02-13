/* global describe, it, beforeEach */

'use strict';

var assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon');

describe('utils/create-steps-lib', function () {

    var testee,
        stubs = {},
        stepsFilePattern = 'steps/**/*.steps.js';

    beforeEach(function () {
        stubs.fs = {
            readFileSync: sinon.stub().returns('a feature'),
            writeFileSync: sinon.stub()
        };
        stubs.defaultLibraryDefine = sinon.stub();
        stubs.englishLibraryDefine = sinon.stub();
        stubs.frenchLibraryDefine = sinon.stub();
        stubs.yadda = {
            localisation: {
                English: {
                    library: sinon.stub().returns({
                        define: stubs.englishLibraryDefine
                    })
                },
                French: {
                    library: sinon.stub().returns({
                        define: stubs.frenchLibraryDefine
                    })
                }
            },
            Library: sinon.stub().returns({
                define: stubs.defaultLibraryDefine
            }),
            Yadda: sinon.spy(function () {
                this.title = 'Yadda Instance with steps library';
            })
        };

        var files = ['steps.js', 'path/to/steps.js', 'steppy.js'];

        stubs['glob-all'] = {
            sync: sinon.stub().returns(files)
        };
        files.forEach(function (file) {
            stubs[file] = sinon.stub();
        });
        testee = proxyquire('../../../../lib/utils/create-steps-lib', stubs);
    });


    describe('localisation', function () {

        it('should use default library if no localisation given', function () {
            testee(stepsFilePattern, null);
            assert.equal(stubs.yadda.Library.callCount, 1);
        });

        it('should use localisation library if localisation given - I', function () {
            testee(stepsFilePattern, 'English');
            assert.equal(stubs.yadda.localisation.English.library.callCount, 1);
        });

        it('should use localisation library if localisation given - II', function () {
            testee(stepsFilePattern, 'French');
            assert.equal(stubs.yadda.localisation.French.library.callCount, 1);
        });

    });

    describe('other actions', function () {

        var returnVal;
        beforeEach(function () {
            returnVal = testee(stepsFilePattern, null);
        });

        it('should define a close browser step on the library', function () {
            assert.equal(stubs.defaultLibraryDefine.callCount, 1);
            assert.equal(stubs.defaultLibraryDefine.args[0][0], 'close_browser');
            var callback = stubs.defaultLibraryDefine.args[0][1],
                browser = {
                    end: sinon.stub()
                };
            callback.call({browser: browser});
            assert.equal(browser.end.callCount, 1);
        });

        it('should call each step file passing in the library', function () {
            stubs['glob-all'].sync().forEach(function (file) {
                assert.equal(stubs[file].callCount, 1);
                assert.equal(stubs[file].args[0][0].define, stubs.defaultLibraryDefine);
            });
        });

        it('should create new Yadda instance using library and return it', function () {
            assert.equal(stubs.yadda.Yadda.callCount, 1);
            assert.equal(stubs.yadda.Yadda.args[0][0].define, stubs.defaultLibraryDefine);
            assert.equal(returnVal.title, 'Yadda Instance with steps library');
        });
    });


});
