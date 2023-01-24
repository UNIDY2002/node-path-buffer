'use strict';

const {
    CHAR_UPPERCASE_A,
    CHAR_LOWERCASE_A,
    CHAR_UPPERCASE_Z,
} = require('./constants');

module.exports = {
    StringPrototypeCharCodeAt (value, index) {
        return typeof value === 'string' ? value.charCodeAt(index) : value.at(index);
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
        if (typeof value === 'string') {
            return value.toLowerCase();
        } else {
            const clone = Buffer.from(value);
            for (let i = 0; i < clone.length; i++) {
                if (clone[i] >= CHAR_UPPERCASE_A && clone[i] <= CHAR_UPPERCASE_Z) {
                    clone[i] += (CHAR_LOWERCASE_A - CHAR_UPPERCASE_A);
                }
            }
            return clone;
        }
    }
};
