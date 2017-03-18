var makeValidator = require("./validator");

function overload() {
  var defaultFunc = null;
  
  var funcByArgumentLength = {};
  
  var resultFunctionFactory = function () {
    return function () {
      if (!funcByArgumentLength[arguments.length]) {
        if (!defaultFunc) {
          throw new Error('no default handle set');
        }
        
        return defaultFunc.apply(this, arguments);
      }
      
      var validators = funcByArgumentLength[arguments.length];
      
      for (var i = 0; i < validators.length; i++) {
        var validator = validators[i];
        var passed = true;
        
        for (var j = 0; j < validator.length; j++) {
          if (!validator[j].$typeCheck(arguments[j])) {
            passed = false;
            break;
          }
        }
        
        if (passed) {
          return validator.cb.apply(this, arguments);
        }
      }
      
      if (!defaultFunc) {
        throw new Error('no default handle set');
      }
      
      return defaultFunc.apply(this, arguments);
    };
  };
  
  var resultFunction = resultFunctionFactory();
  
  resultFunction.overload = function () {
    var validatorArray = [];
    var args = [].slice.call(arguments, 0);
    var cb = args.pop();
    
    if ('function' !== typeof cb) {
      throw new Error('callback is not a function');
    }
    
    validatorArray.cb = cb;
    // console.log('Adding method');
    var signatures = [];
    
    for (var i = 0; i < args.length; i++) {
      var validator = makeValidator(args[i]);
      // console.log('  args ' + (i + 1) + ' of ' + args.length + ' : ' + validator.$typeDescription);
      signatures.push(validator.$typeSignature);
      validatorArray.push(validator);
    }
    
    // console.log('  method signature is ' + signatures.join(','));
    funcByArgumentLength[args.length] =
      funcByArgumentLength[args.length] || [];
    funcByArgumentLength[args.length].push(validatorArray);
    return resultFunction;
  };
  
  resultFunction.default = function (cb) {
    defaultFunc = cb;
    return resultFunction;
  };
  
  resultFunction.clean = function () {
    return resultFunctionFactory();
  };
  
  Object.defineProperty(resultFunction, "defaultFunc", {
    enumerable: true,
    configurable: false,
    get: function () {
      return defaultFunc;
    }
  });
  
  Object.defineProperty(resultFunction, "funcByArgumentLength", {
    enumerable: true,
    configurable: false,
    get: function () {
      return funcByArgumentLength;
    }
  });
  
  if (arguments.length > 0) {
    var args = [].slice.call(arguments, 0);
    resultFunction.default.apply(resultFunction, args);
  }
  
  return resultFunction;
}

module.exports = overload;