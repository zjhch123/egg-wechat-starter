'use strict';

module.exports = {
  error(msg, code = 500) {
    return {
      code,
      content: msg,
    };
  },
  success(msg = 'success') {
    return {
      code: 200,
      content: msg,
    };
  },
};
