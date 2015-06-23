define(["angular"], function(angular) {
angular.module("os-search").run(["$templateCache", function($templateCache) {
  'use strict';

  $templateCache.put('templates/os-search.html',
    "<input class=\"os-search\" type=\"text\" autocomplete=\"on\" placeholder=\"qwerty\" />"
  );
}]);
});