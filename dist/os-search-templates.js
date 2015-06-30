angular.module('os-search').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/os-search.html',
    "<input class=\"os-search\"\n" +
    "       type=\"search\"\n" +
    "       autocomplete=\"on\"\n" +
    "       placeholder=\"{{options.placeholder}}\"\n" +
    "       ng-model=\"searchInput\"\n" +
    "       ng-focus=\"searchHidden = false\"/>\n" +
    "<div class=\"os-search-results\" ng-show=\"searchInput.length > 2 && !searchHidden && resultsAvailable()\">\n" +
    "    <div ng-repeat=\"column in searchResults | orderObjectBy:'received'\" ng-if=\"column.error || column.inProgress || column.results.length > 0\">\n" +
    "        <div class=\"os-search-result-header\">{{searchProviders[column.providerId].title}}</div>\n" +
    "\n" +
    "        <div class=\"os-search-result\" ng-if=\"column.inProgress\">\n" +
    "            <p>In progress...</p>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"os-search-result\" ng-if=\"column.error\">\n" +
    "            <p>Error</p>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"os-search-result\"\n" +
    "             ng-if=\"column.results\"\n" +
    "             ng-repeat=\"result in column.results\"\n" +
    "             ng-click=\"selectResult(result, searchProviders[column.providerId].onSelect)\">\n" +
    "            <p ng-if=\"result.text\">{{result.text}}</p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );

}]);
