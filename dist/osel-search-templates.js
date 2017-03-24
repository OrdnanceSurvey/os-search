angular.module('osel-search').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/osel-search.html',
    "<div layout=\"column\" class=\"osel-search-wrapper\">\n" +
    "    <input flex class=\"osel-search\"\n" +
    "           type=\"search\"\n" +
    "           autocomplete=\"on\"\n" +
    "           placeholder=\"{{options.placeholder}}\"\n" +
    "           ng-model=\"searchInput\"\n" +
    "           ng-focus=\"searchHidden = false\" />\n" +
    "    <md-tabs md-center-tabs=\"true\" md-dynamic-height=\"\" ng-show=\"checkToShowResults(searchInput.length)\" class=\"md-whiteframe-1dp\">\n" +
    "        <md-tab ng-repeat=\"column in options.providers\"\n" +
    "                label=\"{{column.title}} ({{aggregateLength(column)}})\">\n" +
    "            <div class=\"osel-tab-container\">\n" +
    "                <div layout-xs=\"column\" layout-align-xs=\"start stretch\" layout=\"row\" layout-align=\"center start\" >\n" +
    "                    <md-list ng-repeat=\"provider in column.providers\" class=\"osel-search-results-column\" flex>\n" +
    "                        <md-subheader ng-if=\"::provider.title\">{{provider.title}}</md-subheader>\n" +
    "                        <md-list-item ng-repeat=\"result in searchResults[provider.id].results\" ng-click=\"selectResult(result, provider.onSelect)\" class=\"osel-search-result\">\n" +
    "                            <div class=\"md-list-item-text\">{{result.text}}</div>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item ng-hide=\"searchResults[provider.id].results.length\">\n" +
    "                            <div class=\"md-list-item-text\" ng-show=\"searchResults[provider.id].inProgress\">Loading...</div>\n" +
    "                            <div class=\"md-list-item-text\" ng-hide=\"searchResults[provider.id].inProgress\">No results found.</div>\n" +
    "                        </md-list-item>\n" +
    "                        <md-divider hide-gt-xs ng-show=\"column.providers.length > 1\"></md-divider>\n" +
    "                    </md-list>\n" +
    "                </div>\n" +
    "                <p class=\"osel-search-footer md-caption\" ng-if=\"column.footer\">{{::column.footer}}</p>\n" +
    "            </div>\n" +
    "        </md-tab>\n" +
    "    </md-tabs>\n" +
    "</div>"
  );

}]);
