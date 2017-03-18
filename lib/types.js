var types = {};

types.empty = {
  match: function (i) {
    return false;
  },
  validator: {
    $typeCheck : function () {return true},
    $typeDescription: '{any value}',
    $typeSignature: 'a'
  }
};

types.string = {
  match: function (i) {
    return i === String;
  },
  validator: {
    $typeCheck : function (val) {return 'string' === typeof val},
    $typeDescription: 'string',
    $typeSignature: 's'
  }
};

types.number = {
  match: function (i) {
    return i === Number;
  },
  validator: {
    $typeCheck : function (val) {return 'number' === typeof val},
    $typeDescription: 'number',
    $typeSignature: 'n'
  }
};

types.boolean = {
  match: function (i) {
    return i === Boolean;
  },
  validator: {
    $typeCheck : function (val) {return 'boolean' === typeof val},
    $typeDescription: 'boolean',
    $typeSignature: 'b'
  }
};

types.array = {
  match: function (i) {
    Array.isArray(i);
  },
  validator: function (makeValidator, type) {
    var subValidator;
    if (type.length >= 1) {
      subValidator = makeValidator(type[0]);
    } else {
      subValidator = types.empty.validator;
    }
    
    return {
      $typeCheck : function(val) {
        if (!Array.isArray(val)) return false;
        
        for (var i = 0; i < val.length; i++) {
          if (!subValidator.$typeCheck(val[i])) {
            return false;
          }
        }
        
        return true;
      },
      $typeDescription: 'Array of ' + subValidator.$typeDescription,
      $typeSignature: '[' + subValidator.$typeSignature + ']'
    };
  }
};

types.object = {
  match: function (i) {
    return i != null && "object" === typeof i;
  },
  validator: function (makeValidator, type) {
    var subValidatorMap, subValidator;
    
    if ('function' === typeof type.$typeCheck) {
      return type;
    }
    
    var keys = Object.keys(type);
    
    if (keys.length === 0) {
      return types.empty;
    }
    
    subValidatorMap = {};
    
    var description = 'Object that has';
    var subSignatures = [];
    
    for (var key in type) {
      subValidator = makeValidator(type[key]);
      description += ' key ' + key + ' (which is ' + subValidator.$typeDescription + '),';
      subSignatures.push(JSON.stringify(key) + ':' + subValidator.$typeSignature);
      subValidatorMap[key] = subValidator;
    }
    
    return {
      $typeCheck: function (val) {
        if ('object' !== typeof val || val == null) {
          return false;
        }
        
        for (var key in subValidatorMap) {
          if (!val.hasOwnProperty(key)) {
            return false;
          }
          
          if (!subValidatorMap[key].$typeCheck(val[key])) {
            return false;
          }
        }
        
        return true;
      },
      $typeDescription: description,
      $typeSignature: '{' + subSignatures.join(',') + '}'
    };
  }
};

types['function'] = {
  match: function (i) {
    return "function" === typeof i &&
      i !== String &&
      i !== Number &&
      i !== Boolean;
  },
  validator: function (makeValidator, type) {
    if ('function' === typeof type.$typeCheck) {
      return type;
    }
    
    return {
      $typeCheck: function (val) {
        return val instanceof type;
      },
      $typeDescription: type.name, 
      $typeSignature: '{' + type.name + '}' 
    };
  }
};

var typeArr = [
  types.empty, 
  types.string, 
  types.number, 
  types.boolean, 
  types.array, 
  types.object, 
  types['function']
];

function makeAlias(name) {
  var validator = types[name].validator;
  var wrapped = 'function' === typeof validator ? validator : function () {return validator;};
  
  module.exports[name] = function () {
    var makeValidator = require("./validator");
    var args = [].slice.call(arguments, 0);
    return wrapped.apply(this, [makeValidator].concat(args));
  }
}

function unshift(name, validator, matcher) {
  if (!matcher) {
    matcher = function () {
      return false;
    }
  }
  
  if (validator == null || ('object' !== typeof validator && 'function' !== typeof validator)) {
    throw new Error('validator param must either be a validator object or a validator factory');
  }
  
  var rule = {
    match: matcher,
    validator: validator
  }
  
  types[name] = rule;
  typeArr.unshift(rule);
  
  makeAlias(name);
}

unshift('equal', function(makeValidator, targetVal) {
  return {
    $typeCheck: function (val) {
      return val === targetVal;
    },
    $typeDescription: "value that equal to " + targetVal,
    $typeSignature: "{exact:" + targetVal + "}"
  };
})

unshift('and', function (makeValidator, rule1, rule2) {
  var type1 = makeValidator(rule1);
  var type2 = makeValidator(rule2);
  
  return {
    $typeCheck: function (val) {
      return type1.$typeCheck(val) && type2.$typeCheck(val);
    },
    $typeDescription: "value is both (" + type1.$typeDescription + ') and (' + type2.$typeDescription + ')',
    $typeSignature: "{" + type1.$typeSignature + '&&' + type2.$typeSignature + "}"
  };
});

unshift('or', function (makeValidator, rule1, rule2) {
  var type1 = makeValidator(rule1);
  var type2 = makeValidator(rule2);
  
  return {
    $typeCheck: function (val) {
      return type1.$typeCheck(val) || type2.$typeCheck(val);
    },
    $typeDescription: "value is (" + type1.$typeDescription + ') or (' + type2.$typeDescription + ')',
    $typeSignature: "{" + type1.$typeSignature + '||' + type2.$typeSignature + "}"
  };
});

unshift('biggerThan', function (makeValidator, num) {
  return {
    $typeCheck: function (val) {
      return "number" === typeof num && val > num;
    },
    $typeDescription: "bigger than " + num,
    $typeSignature: "{n>" + num + "}"
  }
});

unshift('smallerThan', function (makeValidator, num) {
  return {
    $typeCheck: function (val) {
      return "number" === typeof num && val < num;
    },
    $typeDescription: "smaller than " + num,
    $typeSignature: "{n<" + num + "}"
  }
});


unshift('biggerEqualThan', function (makeValidator, num) {
  return {
    $typeCheck: function (val) {
      return "number" === typeof num && val >= num;
    },
    $typeDescription: "bigger equal than " + num,
    $typeSignature: "{n>=" + num + "}"
  }
});

unshift('smallerEqualThan', function (makeValidator, num) {
  return {
    $typeCheck: function (val) {
      return "number" === typeof num && val <= num;
    },
    $typeDescription: "smaller equal than " + num,
    $typeSignature: "{n<=" + num + "}"
  }
});

module.exports.$map = types;
module.exports.$list = typeArr;
module.exports.unshift = unshift;