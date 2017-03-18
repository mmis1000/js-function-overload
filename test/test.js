var overload = require("../").overload;
var types = require("../").types;
var makeValidator = require("../").makeValidator;

var assert = require('assert');

describe('Types', function() {
  describe('simple buildin types', function () {
    describe('any value', function() {
      var emptyValidator = types.$map.empty.validator;
      
      it('should validate always pass the validate', function () {
        assert.equal(emptyValidator.$typeCheck(0), true);
        assert.equal(emptyValidator.$typeCheck('string'), true);
        assert.equal(emptyValidator.$typeCheck(true), true);
        assert.equal(emptyValidator.$typeCheck([]), true);
        assert.equal(emptyValidator.$typeCheck({}), true);
      });
    });
    
    describe('string', function() {
      var stringValidator = types.$map.string.validator;
      
      it('should validate the string if it is a string', function () {
        assert.equal(stringValidator.$typeCheck('string'), true);
      });
      
      it('should not validate the string if it is not a string', function () {
        assert.equal(stringValidator.$typeCheck(false), false);
      });
    });
    
    describe('boolean', function() {
      var booleanValidator = types.$map.boolean.validator;
      
      it('should validate the boolean if it is a boolean', function () {
        assert.equal(booleanValidator.$typeCheck(true), true);
      });
      
      it('should not validate the boolean if it is not a boolean', function () {
        assert.equal(booleanValidator.$typeCheck('string'), false);
      });
    });
    
    describe('number', function() {
      var numberValidator = types.$map.number.validator;
      
      it('should validate the number if it is a number', function () {
        assert.equal(numberValidator.$typeCheck(0), true);
      });
      
      it('should not validate the number if it is not a number', function () {
        assert.equal(numberValidator.$typeCheck('string'), false);
      });
    });
    
    describe('array', function() {
      describe('array of anything', function () {
        var arrayValidator = types.$map.array.validator(makeValidator, []);
        
        it('should not pass if the input is is not an array', function () {
          assert.equal(arrayValidator.$typeCheck(null), false);
        });
        
        it('should always pass if the input is a empty array', function () {
          assert.equal(arrayValidator.$typeCheck([]), true);
        });
        
        it('should always pass whatever there is anything in the array', function () {
          assert.equal(arrayValidator.$typeCheck(['string', 0, true, function () {}]), true);
        });
      });
      
      describe('array of number', function () {
        var arrayOfNumberValidator = types.$map.array.validator(makeValidator, [Number]);
        
        it('should not pass if the input is is not an array', function () {
          assert.equal(arrayOfNumberValidator.$typeCheck(null), false);
        });
        
        it('should always pass if the input is a empty array', function () {
          assert.equal(arrayOfNumberValidator.$typeCheck([]), true);
        });
        
        it('should validate the array of number if the input is', function () {
          assert.equal(arrayOfNumberValidator.$typeCheck([1, 2, 3]), true);
        });
        
        it('should not validate the array of number if the input isn\'t', function () {
          assert.equal(arrayOfNumberValidator.$typeCheck([1, '2', 3]), false);
        });
      });
    });
    
    describe('map', function () {
      describe('map validator', function() {
        var emptyObjectValidator = types.$map.object.validator(makeValidator, {a: Number});
        
        it('should not pass if the input is not an object', function () {
          assert.equal(emptyObjectValidator.$typeCheck(null), false);
        });
        
        it('should not pass if the field doesn\'t match', function () {
          assert.equal(emptyObjectValidator.$typeCheck({a: true}), false);
        });
        
        it('should pass if the field matchs', function () {
          assert.equal(emptyObjectValidator.$typeCheck({a: 1}), true);
        });
      });
    });
    
    describe('function', function () {
      describe('regex validator initiated with class', function () {
        var regexValidator = types.$map['function'].validator(makeValidator, RegExp);
        
        it('should not pass if the input is not a regex object', function () {
          assert.equal(regexValidator.$typeCheck({}), false);
        });
        
        it('should pass if the input is a regex object', function () {
          assert.equal(regexValidator.$typeCheck(/regex/i), true);
        });
      });
    });
  });
  
  describe('add custom types', function () {
    it('should be able to add odd validator', function () {
      types.unshift('isOdd', {
        $typeCheck: function (val) {
          return 'number' === typeof val && 
            val % 1 === 0 && 
            val % 2 !== 0;
        },
        $typeDescription: "an odd number",
        $typeSignature: "{odd number}"
      });
      
      assert.equal('function', typeof types.isOdd);
      assert.equal(types.isOdd().$typeCheck(null), false);
      assert.equal(types.isOdd().$typeCheck(0), false);
      assert.equal(types.isOdd().$typeCheck(1), true);
    });
  });
  
  describe('logical types', function () {
    describe('or', function () {
      describe('string or number validator', function () {
        var stringOrNumberValidator = types.or(String, Number);
        
        it('should not pass if it is not a string nor a number', function () {
          assert.equal(stringOrNumberValidator.$typeCheck(null), false);
        });
        
        it('should pass if it is a string or a number', function () {
          assert.equal(stringOrNumberValidator.$typeCheck(1), true);
          assert.equal(stringOrNumberValidator.$typeCheck("string"), true);
        });
      });
    });
    
    describe('and', function () {
      describe('smaller than 1 and bigger than -1 validator', function () {
        var smallerThan1AndBiggerThanNegativeOneOperator = types.and(
          types.biggerThan(-1),
          types.smallerThan(1)
        );
        
        it('should not pass if the input doesn\' match', function () {
          assert.equal(smallerThan1AndBiggerThanNegativeOneOperator.$typeCheck(3), false);
        });
        
        it('should pass if the input matches', function () {
          assert.equal(smallerThan1AndBiggerThanNegativeOneOperator.$typeCheck(0), true);
          assert.equal(smallerThan1AndBiggerThanNegativeOneOperator.$typeCheck(0.5), true);
        });
      });
    });
    
    describe('equal', function () {
      describe('equal validator', function () {
        var equalZeroValidator = types.equal(0);
        
        it('should not pass if the input doesn\' match', function () {
          assert.equal(equalZeroValidator.$typeCheck(3), false);
        });
        
        it('should not pass if the input doesn\' match (2)', function () {
          assert.equal(equalZeroValidator.$typeCheck('0'), false);
        });
        
        it('should pass if the input matches', function () {
          assert.equal(equalZeroValidator.$typeCheck(0), true);
        });
      });
    });
  });
});

describe('Make validator', function() {
  it('nest wroks', function () {
    var validator = makeValidator({
      type: types.equal('user'),
      name: String,
      id: Number,
      tags: [String]
    });
    
    var pass = {
      type: 'user',
      name: 'orz',
      id: 1000,
      tags: ['wow', 'such', 'user']
    };
    
    var fail0 = {
      type: 'group',
      name: 'orz',
      id: 1000,
      tags: ['wow', 'such', 'user']
    };
    
    var fail1 = {
      type: 'user',
      id: 1000,
      tags: ['wow', 'such', 'user']
    };
    
    var fail2 = {
      type: 'user',
      name: 'orz',
      id: 'string',
      tags: ['wow', 'such', 'user']
    };
    
    var fail3 = {
      type: 'user',
      name: 'orz',
      id: 'string',
      tags: ['wow', 'such', null]
    };
    
    assert.equal(validator.$typeCheck(pass), true);
    assert.equal(validator.$typeCheck(fail0), false);
    assert.equal(validator.$typeCheck(fail1), false);
    assert.equal(validator.$typeCheck(fail2), false);
    assert.equal(validator.$typeCheck(fail3), false);
  });
});

describe('Wrapped function', function() {
  it('should wrap the function', function() {
    var overloaded = overload();
    
    assert.equal('function', typeof overloaded);
    assert.equal('function', typeof overloaded.overload);
    assert.equal('function', typeof overloaded.default);
    assert.equal('function', typeof overloaded.clean);
    
    assert.equal(null, overloaded.defaultFunc);
    assert.equal('object', typeof overloaded.funcByArgumentLength);
  });
  
  it('should throw if invoked without default handler', function() {
    var overloaded = overload();
    
    try {
      overloaded();
    } catch (e) {
      return;
    }
    
    assert(false);
  });
  
  it('should wrap the function as default handler', function() {
    var overloaded = overload(function () {
      return 1;
    });
    
    assert.equal('function', typeof overloaded.defaultFunc);
    assert.equal(1, overloaded());
  });
  
  it('should throw if overload the function with non function callback', function() {
    try {
      overload().overload(0);
    } catch (e) {
      return;
    }
    assert(false);
  });
  
  it('should overload the function with given signature', function() {
    var overloaded = overload(function () {
      return 1;
    }).overload(Number, function () {
      return 2
    });
    
    assert.equal(1, overloaded());
    assert.equal(2, overloaded(0));
  });
  
  it('should select the first matched signature', function() {
    var overloaded = overload(function () {
      return 1;
    }).overload(Number, function () {
      return 2;
    }).overload(Number, function () {
      return 3;
    }).overload(Number, Number, function (a, b) {
      return a + b;
    });
    
    assert.equal(1, overloaded());
    assert.equal(2, overloaded(0));
    assert.equal(4, overloaded(2, 2));
  });
  
  it('should also pass this to the wrapped function', function() {
    var overloaded = overload(function () {
      return this.n;
    }).overload(Number, function (a) {
      return this.n + a;
    });
    
    var bar = {
      foo: overloaded,
      n: 1
    };
    
    assert.equal(1, bar.foo());
    assert.equal(3, bar.foo(2));
  });
});

