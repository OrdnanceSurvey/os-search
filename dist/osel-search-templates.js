angular.module('osel-search').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/osel-search.html',
    "<input class=\"osel-search\"\n" +
    "       type=\"search\"\n" +
    "       autocomplete=\"on\"\n" +
    "       placeholder=\"{{options.placeholder}}\"\n" +
    "       ng-model=\"searchInput\"\n" +
    "       ng-focus=\"searchHidden = false\"\n" +
    "       ng-keydown=\"keyFromInput($event)\"/>\n" +
    "<div class=\"osel-search-results\" ng-show=\"searchInput.length > 2 && !searchHidden && resultsAvailable()\">\n" +
    "    <div class=\"osel-search-result-column\" ng-repeat=\"column in searchResults | orderObjectBy:'received'\" ng-if=\"column.error || column.inProgress || column.results.length > 0\" data-provider-id=\"{{column.providerId}}\">\n" +
    "        <div class=\"osel-search-result-header\">{{searchProviders[column.providerId].title}}</div>\n" +
    "\n" +
    "        <div class=\"osel-search-result\" ng-if=\"column.inProgress\">\n" +
    "            <p>In progress...</p>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"osel-search-result\" ng-if=\"column.error\">\n" +
    "            <p>Error</p>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"osel-search-result\"\n" +
    "             ng-if=\"column.results\"\n" +
    "             ng-repeat=\"result in column.results\"\n" +
    "             ng-click=\"selectResult(result, searchProviders[column.providerId].onSelect)\"\n" +
    "             data-search-result-index=\"{{$index}}\"\n" +
    "             data-provider-id=\"{{column.providerId}}\"\n" +
    "             tabindex=\"0\"\n" +
    "             ng-keydown=\"keyFromSearchResult($event, result, column.providerId, searchProviders[column.providerId].onSelect)\">\n" +
    "            <p ng-if=\"result.text\">{{result.text}}</p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );

}]);
