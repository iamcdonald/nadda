
function OptionsList(list, transform) {
    this.options = {};
    this._list = list.slice();

    for (var i = 0, l = list.length; i < l; i++) {
        this.options[transform(list[i])] = list[i];
    }
}

OptionsList.prototype = {
    getValue: function (option) {
        return this.options[option] || (this._list.indexOf(option) >= 0 ? option : null);
    },
    isValid: function (option) {
        return !!this.getValue(option);
    }
};

module.exports = OptionsList;
