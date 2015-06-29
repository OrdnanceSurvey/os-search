var dependencies = ['observeOnScope', '$http', 'rx'];
var osSearchDirective = function osSearchDirective(observeOnScope, $http, rx) {
    return {
        templateUrl: 'templates/os-search.html',
        scope: {
            options: '=osSearch'
        },
        link: function ($scope, elem, attrs) {

            $scope.options = $scope.options || {};
            $scope.options.providers = $scope.options.providers || [];

            $scope.searchResults = {};
            $scope.searchResultsOrderedByTime = [];
            $scope.searchInProgress = {};

            console.log(elem.children.length);

            //var SEARCH_PROVIDERS = [
            //    {
            //        id: 'NAMES',
            //        method: 'GET',
            //        params: {
            //            q: '%s'
            //        },
            //        url: '/mapmaker/api/search/names',
            //        title: 'Places'
            //    },
            //    {
            //        id: 'ADDRESSES',
            //        method: 'GET',
            //        params: {
            //            q: '%s'
            //        },
            //        url: '/mapmaker/api/search/addresses',
            //        title: 'Addresses'
            //    }
            //];

            $scope.searchProviders = $scope.options.providers.reduce(function (providerHashMap, provider) {
                providerHashMap[provider.id] = provider;
                return providerHashMap;
            }, {}); // turn $scope.options.providers into an object hashMap, with provider.id as the key

            // turn search provider JSON into an rx.Observable, with a URL including the search term
            var createSearchProviderObservable = function createSearchProviderObservable(provider, term) {
                if (Object.prototype.toString.call(provider) !== '[object Object]') {
                    throw new Error('Search provider required.');
                }

                var config = angular.copy(provider);
                config.params = config.params || {};
                config.providerId = provider.id;
                delete config.id;

                // inject search term into params and data
                for (var k in config.params) {
                    config.params[k] = config.params[k].replace('%s', term);
                }
                for (k in config.data) {
                    config.data[k] = config.data[k].replace('%s', term);
                }

                //$scope.searchInProgress[provider.id] = true;

                return rx.Observable.fromPromise($http(config));
            };

            // create an rx.Observable from the user input changes
            var throttledInput = observeOnScope($scope, 'searchInput').debounce(500).map(function (e) {
                return e.newValue;
            }).filter(function (term) {

                // only search on 3+ characters
                var ok = term && term.length && term.length > 2;

                // reset the search results whenever input changes
                $scope.options.providers.forEach(function (e) {
                    $scope.searchResults[e.id] = [{
                        name: 'In progress'
                    }];
                    $scope.searchResults[e.id].providerId = e.id;
                    $scope.searchResults[e.id].inProgress = true;
                    $scope.searchInProgress[e.id] = ok;
                });

                return ok;
            }).distinctUntilChanged(); // ignore duplicate searches if value didn't change since last search


            throttledInput.subscribe(function (term) {
                $scope.options.providers.forEach(function (e) {
                    $scope.searchResults[e.id] = []; // don't display out of date results to the user

                    // create observable of the provider AJAX, then update scope on change
                    createSearchProviderObservable(e, term).subscribe(function (response) {
                        console.log(response.data.length + ' results for ' + e.id + ' \'' + term + '\'', response.data);
                        $scope.searchInProgress[e.id] = false;

                        $scope.searchResults[e.id].inProgress = false;
                        response.data.received = new Date(); // store date received so we can order by incoming time
                        response.data.providerId = e.id;
                        response.data.term = term;

                        $scope.searchResults[e.id] = response.data;
                    }, function (error) {
                        console.log('error querying ' + e.id + ' (' + term + ')', error);
                        $scope.searchInProgress[e.id] = false;

                        $scope.searchResults[e.id] = [{
                            error: error.data.error
                        }];
                        $scope.searchResults[e.id].inProgress = false;
                        $scope.searchResults[e.id].received = new Date();
                        $scope.searchResults[e.id].term = term;
                        $scope.searchResults[e.id].providerId = e.id;

                    }, function () {
                        //console.log('done querying ' + e.id + ' (' + term + ')');
                    });
                });
            });

            // whenever some results become available, create an array which is sorted by time
            $scope.$watch('searchResults', function () {

                // create array
                $scope.searchResultsOrderedByTime = [];
                for (var k in $scope.searchResults) {
                    $scope.searchResultsOrderedByTime.push($scope.searchResults[k]);
                }

                // sort the array by incoming time
                $scope.searchResultsOrderedByTime = $scope.searchResultsOrderedByTime.sort(function (a, b) {
                    if (a.received > b.received) {
                        return 1;
                    }
                    if (a.received < b.received) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                });
            }, true); // true ==> deep watch

            // lookup unfriendly types against a dictionary for display-friendly values
            $scope.friendlyType = function friendlyType(type) {
                var friendlies = {
                    NAMED_ROAD: 'Named Road',
                    POPULATED_PLACE: 'Populated Place',
                    ADDRESS: 'Address'
                };

                return friendlies[type] || type;
            };

            $scope.isOneOrMoreSearchInProgress = function isOneOrMoreSearchInProgress() {
                for (var k in $scope.searchInProgress) {
                    if (!!$scope.searchInProgress[k]) {
                        return true;
                    }
                }
                return false;
            };

            // true if any results are available
            $scope.isOneOrMoreSearchResultAvailable = function isOneOrMoreSearchResultAvailable() {
                return $scope.searchResultsOrderedByTime.filter(function (e) {
                        return e.length > 0 && !e.inProgress;
                    }).length > 0;
            };



        }
    };
};
angular.module('os-search').directive('osSearch', dependencies.concat([osSearchDirective]));
