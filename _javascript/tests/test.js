describe('Multiply', function() {
  it('should multiply the two numbers together', function() {
    var functions = require('../functions/functions');

    expect(functions.multiply(2, 3)).toBe(6);
    expect(functions.multiply(5, 7)).toBe(35);
    expect(functions.multiply(7.75, 12.5)).toBe(96.875);
  });
})

describe('Secrify', function() {
  it('should produce a coded number', function() {
    var functions = require('../functions/functions');

    expect(functions.secrify(2, 3)).toBe(31);
    expect(functions.secrify(5, 7)).toBe(74);
  });
})