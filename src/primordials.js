'use strict';

module.exports = {
    StringPrototypeCharCodeAt (value, index) {
        return value.charCodeAt(index);
    },

    StringPrototypeIndexOf (value, target) {
        return value.indexOf(target);
    },

    StringPrototypeLastIndexOf (value, target) {
        return value.lastIndexOf(target);
    },

    StringPrototypeReplace (value, target, replace) {
        return value.replace(target, replace);
    },

    StringPrototypeSlice (value, start, end) {
        return value.slice(start, end);
    },

    StringPrototypeToLowerCase (value) {
        return value.toLowerCase();
    }
};
