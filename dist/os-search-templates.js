angular.module('os-search').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/os-search.html',
    "<input class=\"os-search\" type=\"search\" autocomplete=\"on\" placeholder=\"Start typing to search...\"\n" +
    "       ng-model=\"searchInput\"/>\n" +
    "<div class=\"os-search-results\" ng-show=\"isOneOrMoreSearchInProgress() || isOneOrMoreSearchResultAvailable()\">\n" +
    "    <div ng-repeat=\"results in searchResultsOrderedByTime\">\n" +
    "        <div class=\"os-search-result-header\">{{searchProviders[results.providerId].title}}</div>\n" +
    "        <div class=\"os-search-result\" ng-repeat=\"result in results\">\n" +
    "            <p ng-if=\"result.name\">{{result.name}} <span ng-if=\"result.locality\">, {{result.locality}}</span></p>\n" +
    "            <p ng-if=\"result.error\" title=\"{{result.error}}\">Error</p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );

}]);
