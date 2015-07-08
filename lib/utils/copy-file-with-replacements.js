var fs = require('fs');
    cache = {};

module.exports = function (fileLocation, copyLocation, replacements) {
    if (!cache[fileLocation]) {
        cache[fileLocation] = fs.readFileSync(fileLocation, 'UTF-8');
    }
    var fileContent = cache[fileLocation],
        re;
    for (var find in replacements) {
        if (replacements.hasOwnProperty(find)) {
            re = new RegExp(find, 'g');
            fileContent = fileContent.replace(re, replacements[find]);
        }
    }
    fs.writeFileSync(copyLocation, fileContent, 'UTF-8');
};
