var dependencies = ['observeOnScope', '$http', 'rx', '$timeout'];
var osSearchDirective = function osSearchDirective(observeOnScope, $http, rx, $timeout) {
    return {
        templateUrl: 'templates/os-search.html',
        scope: {
            options: '=osSearch'
        },
        link: function ($scope, elem, attrs) {

            $scope.options = $scope.options || {};
            $scope.options.providers = $scope.options.providers || [];

            $scope.searchResults = {};
            $scope.searchInProgress = {};

            // turn $scope.options.providers into an object hashMap, with provider.id as the key
            $scope.searchProviders = $scope.options.providers.reduce(function (providerHashMap, provider) {
                providerHashMap[provider.id] = provider;
                return providerHashMap;
            }, {});

            // turn search provider JSON into an rx.Observable, with a URL including the search term
            var observableWithAJAXConfig = function observableWithAJAXConfig(provider, term) {
                var config = {
                    params: angular.copy(provider.params),
                    data: angular.copy(provider.data),
                    url: provider.url,
                    method: provider.method
                };

                // inject search term into params and data
                for (var k in config.params) {
                    config.params[k] = config.params[k].replace('%s', term);
                }
                for (k in config.data) {
                    config.data[k] = config.data[k].replace('%s', term);
                }

                return rx.Observable.fromPromise($http(config));
            };

            var observableFromFn = function observableFromFn(fn, term) {
                //return rx.Observable.fromCallback(fn)(term);

                return rx.Observable.create(function(observer) {
                    try {
                        setTimeout(function() {
                            observer.onNext(fn.call(this, term));
                            observer.onCompleted();
                        }, 1000);

                    } catch (e) {
                        console.error( e);
                        observer.onError(e);
                    }
                });
            };

            var createProviderObservable = function createProviderObservable(provider, term) {
                // check if provider is 'function' type
                if (provider.hasOwnProperty('fn')) {
                    return observableFromFn(provider.fn, term);
                } else { // else assume provider is 'AJAX' type
                    return observableWithAJAXConfig(provider, term);
                }
            };

            // create an rx.Observable from the user input changes
            var throttledInput = observeOnScope($scope, 'searchInput').debounce(200).map(function (e) {
                return e.newValue;
            }).filter(function (term) {
                // reset the search results for each provider whenever input changes
                $scope.options.providers.forEach(function (provider) {
                    $scope.searchResults[provider.id] = $scope.searchResults[provider.id] || {};
                    $scope.searchResults[provider.id].providerId = provider.id; // need to save the id because orderObjectBy changes Object into an Array
                    $scope.searchResults[provider.id].results = [];
                });

                // only search on 3+ characters
                return term && term.length && term.length > 2;
            }).distinctUntilChanged(); // ignore duplicate searches if value didn't change since last search

            // fire off requests to providers based on throttled search term
            throttledInput.subscribe(function (term) {

                var observables = $scope.options.providers.map(function(provider) {

                    $timeout(function() {
                        $scope.searchResults[provider.id].inProgress = true;
                        $scope.searchResults[provider.id].results = [];
                        $scope.searchResults[provider.id].error = undefined;
                        $scope.searchResults[provider.id].received = Infinity;
                    });


                    var providerObservable = createProviderObservable(provider, term);
                    providerObservable.providerId = provider.id;
                    providerObservable.term = term;
                    providerObservable.sent = new Date();
                    providerObservable.config = provider;

                    return providerObservable;
                });

                //if (!$scope.$$phase) {
                //    $scope.$digest();
                //}

                observables.forEach(function(providerObservable) {
                    providerObservable.subscribe(function (response) {

                        $timeout(function() {
                            // call tranformResponse function if provided
                            if (providerObservable.config.transformResponse) {
                                response = providerObservable.config.transformResponse.call(this,response);
                            }

                            // check that response is for the current search term
                            if ($scope.searchInput === providerObservable.term) {
                                $scope.searchResults[providerObservable.providerId].inProgress = false;
                                $scope.searchResults[providerObservable.providerId].results = response.results;
                                $scope.searchResults[providerObservable.providerId].error = "";
                                $scope.searchResults[providerObservable.providerId].sent = providerObservable.sent;
                                $scope.searchResults[providerObservable.providerId].received = new Date();

                                // changes made to scope, so tell angular to digest
                                if (!$scope.$$phase) {
                                    $scope.$digest();
                                }
                            } else {
                                // don't update the UI if the response is from a different search
                            }

                        });

                    }, function (error) {
                        $scope.searchResults[providerObservable.providerId].inProgress = false;
                        $scope.searchResults[providerObservable.providerId].results = [];
                        $scope.searchResults[providerObservable.providerId].error = error.data.error || error.data; // TODO check this logic with a real server error
                        //$scope.searchResults[providerObservable.providerId].received = new Date();
                        $scope.searchResults[providerObservable.providerId].received = Infinity; // needs to be infinity so that we can sort errors to the right
                        $scope.searchResults[providerObservable.providerId].sent = providerObservable.sent; // TODO check this is available

                    });
                });
            });

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

            $scope.clearSearch = function clearSearch() {

                $scope.options.providers.forEach(function(provider) {
                    $scope.searchResults[provider.id].inProgress = false;
                    $scope.searchResults[provider.id].results = [];
                    $scope.searchResults[provider.id].error = undefined;
                });

                $scope.searchInput = '';
            };

            $scope.selectResult = function selectResult(result) {
                console.log('result selected: ', result);
                $scope.clearSearch();
            };
        }
    };
};
angular.module('os-search').directive('osSearch', dependencies.concat([osSearchDirective]));
