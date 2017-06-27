// Minify final output!
// Include tests?

// Major dependencies
var 
  $         = require('jquery'),
  f         = require('./functions/basic'),
  component = require('./functions/component')
;

component.activate('h1');

console.log('Multiply 5 and 7, you get ' + f.multiply(5, 7));
console.log('Secrify 5 and 7, you get ' + f.secrify(5, 7));
