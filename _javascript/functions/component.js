var
  $ = require('jquery'),
  f = require('./basic')
;

function containerized_component(patternId) {
  
  // variables
  var pattern = $("#" + patternId);

  
  // What to do when the page loads
  function init() {
    pattern.text('It\'s working like it should!');
  }

  function setEvents() {}

  // Running the initial and event functions for the Super Menu when the page loads
  function docReady() {
    init();
    setEvents();
  }

  $(document).on({
    ready: docReady()
  });
}

exports.activate = function(selector) {
  f.component_init(selector, containerized_component);
}
