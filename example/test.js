var overload = require("../lib/overload");
var t = require("../lib/types");

t.unshift('biggerThan', function (makeValidator, num) {
  return {
    $typeCheck: function (val) {
      return val > num;
    },
    $typeDescription: "bigger than " + num,
    $typeSignature: "{n>" + num + "}"
  }
})

var func = overload(function () {
  console.log('(default func)')
})
.overload(String, t.or(String, t.and(Number, t.biggerThan(0))), function () {
  console.log('1');
})
.overload(String, Number, function () {
  console.log('2');
})
.overload(String, function () {
  console.log('3');
})
.overload([String], function () {
  console.log('4');
})

// this will print (default func)
func()

// this will print 1
func('str', 'test');

// this will print 1
func('str', 1);

// this will print 2
func('str', 0);

// this will print 3
func('str');

// this will print 4
func(['str']);