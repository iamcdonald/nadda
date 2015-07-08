var yadda = require('yadda');

module.exports = {};

for (var l in yadda.localisation) {
    if (yadda.localisation.hasOwnProperty(l)) {
        module.exports[l.toUpperCase()] = l;
    }
}
