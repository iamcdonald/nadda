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
nadda -f tests/**/*.feature -s tests/**/*.steps.js
```
The test runner supports a number of run-time options to be passed at. To view all, run the following:
```sh
$ nadda --help
```
| Name          | Shortname | Default       | Description
|-------------- |-----------|---------------|-------------------------------
| features      | f         | ```**/*.feature```  | globs to select feature files
| steps         | s         | ```**/*.steps.js``` | globs to select steps files  
| config        | c         |               | file path to local nightwatch.json if you want to override/add to nightwatch config
| localisation  | l         |               | selects the Yadda localisation library to pass to step files
| env           | e         | ```PHANTOMJS```     | selects the browser environment to use

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
  env: nadda.BROWSERS.CHROME
}).finally(function () {
  //do something
});
```
