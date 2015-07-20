'use strict';

module.exports = function (lib) {
    lib.when(/I type in (\w*)/, function (searchTerm) {
        this.browser.setValue('input#search_form_input_homepage', searchTerm);
    })
    .when('I click search', function () {
        this.browser.waitForElementVisible('input#search_button_homepage', 1000)
            .click('input#search_button_homepage')
            .pause(1000);
    });
};
