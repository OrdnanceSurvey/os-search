angular.module('os-search').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/os-search.html',
    "<input class=\"os-search\"\n" +
    "       type=\"search\"\n" +
    "       autocomplete=\"on\"\n" +
    "       placeholder=\"Start typing to search...\"\n" +
    "       ng-model=\"searchInput\"/>\n" +
    "<div class=\"os-search-results\" ng-show=\"searchInput.length > 2\">\n" +
    "    <div ng-repeat=\"data in searchResults | orderObjectBy:'received'\">\n" +
    "        <div class=\"os-search-result-header\">{{searchProviders[data.providerId].title}}</div>\n" +
    "        <div class=\"os-search-result\" ng-if=\"data.inProgress\">\n" +
    "            <p>In progress...</p>\n" +
    "        </div>\n" +
    "        <div class=\"os-search-result\" ng-if=\"data.error\">\n" +
    "            <p>Error</p>\n" +
    "        </div>\n" +
    "        <div class=\"os-search-result\"\n" +
    "             ng-if=\"data.results\"\n" +
    "             ng-repeat=\"result in data.results\"\n" +
    "             ng-click=\"selectResult(result)\">\n" +
    "            <p ng-if=\"result.text\">{{result.text}}</p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );

}]);
