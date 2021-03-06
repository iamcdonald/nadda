'use strict';

function testRule(tagRule, scenarioTags) {
    for (var i = 0, l = tagRule.length; i < l; i++) {
        if(tagRule[i][0] === '~') {
            if (scenarioTags.indexOf(tagRule[i].slice(1)) >= 0) {
                return false;
            }
        } else {
            if (scenarioTags.indexOf(tagRule[i]) < 0) {
                return false;
            }
        }
    }
    return true;
}

function shouldRunScenario(tagRules, scenarioTags) {
    for(var i = 0, l = tagRules.length; i < l; i++) {
        if (!tagRules[i].length || testRule(tagRules[i], scenarioTags)) {
            return true;
        }
    }
    return false;
}

module.exports = shouldRunScenario;
