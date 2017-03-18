var types = require("./types").$list;

function makeValidator(rawType) {
  var type;
  
  for (var i = 0; i < types.length; i++) {
    type = types[i];
    if (type.match(rawType)) {
      if ('object' === typeof type.validator) {
        return type.validator;
      } else if ('function' === typeof type.validator) {
        return type.validator(makeValidator, rawType);
      } else {
        throw new Error('broken type def: ', type);
      }
    }
  }
  
  throw new Error('cannot cast value' + type + 'to type');
}

module.exports = makeValidator;