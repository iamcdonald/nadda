nadda [![Build Status](https://travis-ci.org/iamcdonald/nadda.svg?branch=master)](https://travis-ci.org/iamcdonald/nadda) [![Coverage Status](https://coveralls.io/repos/iamcdonald/nadda/badge.svg?branch=master&service=github)](https://coveralls.io/github/iamcdonald/nadda?branch=master)
===============

A zero config plugin for BDD acceptance testing in the browser using a combination of
[yadda](https://github.com/acuminous/yadda), [nightwatch](http://nightwatchjs.org), [selenium](http://docs.seleniumhq.org), [chromedriver](https://sites.google.com/a/chromium.org/chromedriver/), [phantomjs](http://phantomjs.org) and [iedriver](https://code.google.com/p/selenium/wiki/InternetExplorerDriver) (if applicable).

## Install

```sh
$ npm install nadda
```

## Command Line
nadda includes a command-line test runner to easily run a suite e.g.
```sh
nadda -f 'tests/**/*.feature' -s 'tests/**/*.steps.js'
```
Things to note:
- If using globbing in paths you may need to surround in quotes to stop the OS from resolving these prior to passing to nadda.
- Globbed file paths don't support the use of ```~```. 

The test runner supports a number of run-time options.
To view all, run the following:
```sh
$ nadda --help
```
| Name          | Shortname | Default       | Description
|-------------- |-----------|---------------|-------------------------------
| features      | f         | ```['**/*.feature', '!node_modules/**/*']```  | globs to select feature files.
| steps         | s         | ```['**/*.steps.js', '!node_modules/**/*']``` | globs to select steps files.  
| config        | c         |               | file path to local nightwatch.json if you want to override/add to nightwatch config.
| localisation  | l         |               | selects the Yadda localisation library to pass to step files.
| env           | e         | ```PHANTOMJS```     | selects the browser environment to use.
| tags          | t         |               | tags to determine which scenarios to run.<br>```--tags ~@wip``` <br>will run scenarios that do not have the ```@wip``` tag.<br>```--tags @wip``` <br>will run scenarios that have the ```@wip``` tag.<br>```--tags ~@wip,@feature``` <br>will run scenarios that do not have the ```@wip``` tag AND have the ```@feature``` tag. <br>```--tags ~@wip --tags @feature``` <br>will run scenarios that do not have the ```@wip``` tag OR have the ```@feature``` tag.
## API
nadda can be required into a project exposing a function which takes the same options as the command line tool and returns a promise.
A list of possible yadda localisations and environments can be found under ```nadda.LOCALISATIONS``` and ```nadda.BROWSERS``` respectively.

```js
var nadda = require('nadda');
nadda({
  features: 'tests/**/*.js',
  steps: 'tests/**/*.steps.js',
  config: 'path/to/nightwatch.json',
  localisation: nadda.LOCALISATIONS.ENGLISH,
  env: nadda.BROWSERS.CHROME,
  tags: [['~@wip', '@feature'], ['@done']]
}).finally(function () {
  //do something
});
```
### Writing Yadda Steps
Step files should be written as CommonJS modules exporting a single function that will, at runtime, be passed a yadda library (the type of which can be defined using the 'localisation' option) on which to register steps e.g.
```js
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
```
Each step itself has access to the nightwatch browser object (```this.browser```) and a context object (```this.ctx```). The context object can be used to pass data between steps and is initially populated with the amalgamated annotations  (```this.ctx.annotations```) of the feature and scenario currently being run (if a feature and scenario annotation of the same name exist the scenario annotation will win out).  
