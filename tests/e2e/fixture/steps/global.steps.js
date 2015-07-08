module.exports = function(lib) {
  lib
    .given(/I visit (http:\/\/\w+\.\w+\.\w+)/, function (url, next) {
        this.browser
            .url(url)
            .waitForElementVisible('body', 1000);
    }).
    then(/'([^']*)' exists in the page/, function (expectedContent, next) {
        this.browser.assert.containsText('#links', expectedContent);
    });

};
