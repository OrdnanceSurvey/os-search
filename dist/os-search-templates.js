angular.module('os-search').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/os-search.html',
    "<input class=\"os-search\" type=\"search\" autocomplete=\"on\" placeholder=\"Start typing to search...\"\n" +
    "       ng-model=\"searchInput\"/>\n" +
    "<!--<div class=\"os-search-results\" ng-show=\"isOneOrMoreSearchInProgress() || isOneOrMoreSearchResultAvailable()\">-->\n" +
    "<div class=\"os-search-results\" ng-show=\"searchInput.length > 2\">\n" +
    "    <!--<div ng-repeat=\"(id, results) in searchResultsOrderedByTime\">-->\n" +
    "        <!--<div class=\"os-search-result-header\">{{searchProviders[results.providerId].title}}</div>-->\n" +
    "        <!--<div class=\"os-search-result\" ng-repeat=\"result in results\">-->\n" +
    "            <!--<p ng-if=\"result.name\">{{result.name}} <span ng-if=\"result.locality\">, {{result.locality}}</span></p>-->\n" +
    "            <!--<p ng-if=\"result.error\">Error</p>-->\n" +
    "        <!--</div>-->\n" +
    "    <!--</div>-->\n" +
    "    <div ng-repeat=\"(id, data) in searchResults\">\n" +
    "        <div class=\"os-search-result-header\">{{searchProviders[id].title}}</div>\n" +
    "        <div class=\"os-search-result\" ng-show=\"data.inProgress\">\n" +
    "            <p>In progress...</p>\n" +
    "        </div>\n" +
    "        <div class=\"os-search-result\" ng-repeat=\"result in data.results\">\n" +
    "            <p ng-if=\"result.name\">{{result.name}} <span ng-if=\"result.locality\">, {{result.locality}}</span></p>\n" +
    "            <p ng-if=\"result.error\">Error</p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<!--<pre>{{searchResultsOrderedByTime | json}}</pre>-->\n" +
    "<pre>{{searchResults | json}}</pre>"
  );

}]);
