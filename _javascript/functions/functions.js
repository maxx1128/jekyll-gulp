exports.multiply = function(x, y) {
  return x * y;
}



exports.secrify = function(x, y) {
  var code1 = 2.453,
      code2 = 3.333,
      result = (x + (y * code1)) * code2,
      rounded = Math.round(result);
  
  return rounded;
}