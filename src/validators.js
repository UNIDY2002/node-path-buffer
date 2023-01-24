'use strict';

function validateString (value, name) {
  if (typeof value !== 'string')
    throw new Error(`Invalid type for "${name}" argument, expecting string.`);
}

module.exports = {
  validateString,
};
