'use strict';

function validateString (value, name) {
  if (typeof value !== 'string' && !(value instanceof Buffer))
    throw new Error(`Invalid type for "${name}" argument, expecting string | Buffer.`);
}

module.exports = {
  validateString,
};
