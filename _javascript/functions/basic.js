var
  $ = require('jquery')
;

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

exports.component_init = function(selector, component_function) {
  $(selector).each(function(){

    var id = $(this).attr('id');
    
    if ( typeof id === typeof undefined && id !== false ) {
      
      id = 'IDUNIQUE_' + Math.floor((Math.random() * 99999999999999999) + 1);;
      $(this).attr('id', id);
    }
    
    component_function(id);
  });
}
