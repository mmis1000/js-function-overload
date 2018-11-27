Function overload
===================

[![Greenkeeper badge](https://badges.greenkeeper.io/mmis1000/js-function-overload.svg)](https://greenkeeper.io/)

overload the function with flexible way

Usage
===================

load this library
```javascript
var overload = require("function-overload").overload;
```

create templete method
```javascript
var newFunc = overload();
```

or init method with default handle
```javascript
var newFunc = overload(function (...args) {
    // code goes here
});
```

set the default handle
```javascript
var newFunc = overload();
newFunc["default"](function (...args) {
    // code goes here
});
```

overload with given signature
```javascript
var newFunc = overload();

// method 1
newFunc.overload([Number], function (arr) {
    // handle the array of number
});

// method 2
newFunc.overload([Boolean], function (arr) {
    // handle the array of boolean
});

// method 3
newFunc.overload(Number, function (num) {
    // handle the number
});

newFunc([1]); // trigger method 1
newFunc([true]); // trigger method 2
newFunc(1); // trigger method 3
newFunc(); // throws, because no one can handle it and default handler does no exist
```

nested signature
```javascript
var newFunc = overload();

// method 1
newFunc.overload([{id: Number, name: String}], function (arrOfUser) {
    // handle these users
});

newFunc([{id: 0, name: 'root'}]); // trigger method 1
newFunc([{id: '0', name: 'root'}]]); //throws, because no one can handle it
```

special types

requires these types first
```javascript
var types = require("function-overload").types;
```

equal
<br>
virtual type matches only when the content is exactly equal to target.
```javascript
var newFunc = overload();

newFunc.overload(types.equal(0), function (zero) {
    // handle it
});

newFunc(0); // pass
newFunc(1); // throws
newFunc("0"); // throws
```

biggerThan
<br>
virtual type matches only when the content is a number bigger than passed number.
```javascript
var newFunc = overload();

newFunc.overload(types.biggerThan(0), function (positiveNumber) {
    // handle it
});

newFunc(1); // pass
newFunc(0); // throws
newFunc(-1); // throws
newFunc("1"); // throws
```

smallerThan
<br>
virtual type matches only when the content is a number smaller than passed number.
```javascript
var newFunc = overload();

newFunc.overload(types.smallerThan(0), function (negtiveNumber) {
    // handle it
});

newFunc(1); // throws
newFunc(0); // throws
newFunc(-1); // pass
newFunc("1"); // throws
```

biggerEqualThan
<br>
virtual type matches only when the content is a number bigger than or equal to passed number.
```javascript
var newFunc = overload();

newFunc.overload(types.biggerEqualThan(0), function (positiveNumber) {
    // handle it
});

newFunc(1); // pass
newFunc(0); // pass
newFunc(-1); // throws
newFunc("1"); // throws
```

smallerEqualThan
<br>
virtual type matches only when the content is a number smaller than or equal to passed number.
```javascript
var newFunc = overload();

newFunc.overload(types.smallerEqualThan(0), function (negtiveNumber) {
    // handle it
});

newFunc(1); // throws
newFunc(0); // pass
newFunc(-1); // pass
newFunc("1"); // throws
```

or
<br>
virtual type matches only when one of the two methods matched
```javascript
var newFunc = overload();

newFunc.overload(
types.or(String, Number), function (stringOrNumber) {
    // handle it
});

newFunc(1); // pass
newFunc("1"); // pass
newFunc(true); // throws
```

and
<br>
virtual type matches only when both methods matched
```javascript
var newFunc = overload();

newFunc.overload(types.and(
    types.biggerEqualThan(0),
    types.smallerThan(10)
), function (numberBwetweenOneAndTen) {
    // handle it
});

newFunc(-1); // throws
newFunc(0); // pass
newFunc(9); // pass
newFunc(10); // throws
newFunc(true); // throws
```

custom types
```javascript
t.unshift("odd", function (makeValidator) {
    return {
        $typeCheck: function (val) {
            return "number" === typeof val && ((val % 2) + 2) % 2 === 1;
        },
        $typeDescription: "odd number",
        $typeSignature: "{odd number}"
    }
})

var newFunc2 = overload();

newFunc.overload(types.odd(), function (oddNumber) {
    // handle it
});

newFunc(0); // throws
newFunc(0.5); // throws
newFunc(1); // pass

```

custom type 2
```javascript

t.unshift("not", function (makeValidator, input) {
    // create the validator from input
    var originalValidator = makeValidator(input);
    
    return {
        $typeCheck: function (val) {
             return !originalValidator.$typeCheck(val)
        },
        $typeDescription: "not " + originalValidator.$typeDescription,
        $typeSignature: "{not" + originalValidator.$typeSignature + "}"
    }
})

var newFunc2 = overload();

newFunc2.overload(types.not(Number), function (notNumber) {
    // handle it
});

newFunc(0); // throws
newFunc("0"); // pass
newFunc(true); // pass
```

cleaned method
```javascript
var newFunc = overload(function () {
    return 1;
});
// create cleaned method with the original one
var newFunc2 = newFunc.clean();

newFunc(); // -> 1
newFunc2(); // -> 1

newFunc2.overload(someFunc) // throws
```