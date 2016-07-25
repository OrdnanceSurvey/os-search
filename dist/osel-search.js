/**
 * @license osel-search - v0.0.4-republshed - 25-07-2016
 * (c) 2015 Ordnance Survey Limited
 * License: MIT
 */
'use strict';

(
  function(angular) {
    return angular
      .module('ngOrderObjectBy', [])
      .filter('orderObjectBy', function() {
        return function (items, field, reverse) {

          function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
          }
          
          var filtered = [];

          angular.forEach(items, function(item, key) {
            item.key = key;
            filtered.push(item);
          });

          function index(obj, i) {
            return obj[i];
          }

          filtered.sort(function (a, b) {
            var comparator;
            var reducedA = field.split('.').reduce(index, a);
            var reducedB = field.split('.').reduce(index, b);

            if (isNumeric(reducedA) && isNumeric(reducedB)) {
              reducedA = Number(reducedA);
              reducedB = Number(reducedB);
            }

            if (reducedA === reducedB) {
              comparator = 0;
            } else {
              comparator = reducedA > reducedB ? 1 : -1;
            }

            return comparator;
          });

          if (reverse) {
            filtered.reverse();
          }

          return filtered;
        };
      });
  }
)(angular);

(function() {
    angular.module('osel-search', ['rx', 'ngOrderObjectBy']);
})();
(function() {
    var dependencies = ['observeOnScope', '$http', 'rx', '$timeout', '$filter', '$window'];
    var oselSearchDirective = function oselSearchDirective(observeOnScope, $http, rx, $timeout, $filter, $window) {
        return {
            templateUrl: 'templates/osel-search.html',
            scope: {
                options: '=oselSearch'
            },
            link: function ($scope, elem, attrs) {

                var DEFAULT_INPUT_BUFFER = 200; // use this if $scope.options.buffer is not set

                // ---------- variables setup start -----------
                $scope.options = $scope.options || {};
                $scope.options.providers = $scope.options.providers || [];
                $scope.options.placeholder = $scope.options.hasOwnProperty('placeholder') ? $scope.options.placeholder : 'Start typing to search';
                $scope.searchResults = {};

                // turn $scope.options.providers into a hashmap, with provider.id as the keys
                $scope.searchProviders = $scope.options.providers.reduce(function (providerHashMap, provider) {
                    providerHashMap[provider.id] = provider;
                    return providerHashMap;
                }, {});
                // ---------- variables setup end -----------

                // turn search provider JSON into an rx.Observable, with a URL including the search term
                var observableWithAJAXConfig = function observableWithAJAXConfig(provider, term) {
                    var url = provider.url;
                    if (angular.isFunction(provider.url)) {
                        url = provider.url(term);
                    }
                    var config = {
                        params: angular.copy(provider.params),
                        data: angular.copy(provider.data),
                        dataType: provider.dataType,
                        url: url,
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

                            var result = fn.call(this, term);

                            // if result is a promise, then listen for resolve/reject.  Otherwise, use value immediately
                            if (angular.isFunction(result.then)) {
                                result.then(function(response) {
                                    observer.onNext(response);
                                    observer.onCompleted();
                                }).catch(function(response) {
                                    observer.onError(response);
                                });
                            } else {
                                observer.onNext(result);
                                observer.onCompleted();
                            }
                        } catch (e) {
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
                var throttledInput = observeOnScope($scope, 'searchInput').debounce($scope.options.buffer || DEFAULT_INPUT_BUFFER).map(function (e) {
                    return e.newValue;
                }).distinctUntilChanged(); // ignore duplicate searches if value didn't change since last search

                // fire off requests to providers based on throttled search term
                throttledInput.filter(function (term) {
                    // reset the search results for each provider whenever input changes
                    $scope.options.providers.forEach(function (provider) {
                        $scope.searchResults[provider.id] = $scope.searchResults[provider.id] || {};
                        $scope.searchResults[provider.id].providerId = provider.id; // need to save the id because orderObjectBy changes Object into an Array
                        $scope.searchResults[provider.id].results = [];
                    });

                    // only search on 3+ characters
                    return term && term.length && term.length > 2;
                }).subscribe(function (term) {

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
                            $scope.searchResults[providerObservable.providerId].error = error.data ? error.data.error : error.data; // TODO check this logic with a real server error
                            $scope.searchResults[providerObservable.providerId].received = Infinity; // needs to be Infinity so that we can sort errors to the right
                            $scope.searchResults[providerObservable.providerId].sent = providerObservable.sent; // TODO check this is available

                        });
                    });
                });

                // helper function which returns true when any results are available
                // ignores errors and inProgress, or empty results
                $scope.resultsAvailable = function resultsAvailable() {
                    return $scope.options.providers.filter(function(provider) {
                        var sr = $scope.searchResults[provider.id];
                        return sr.inProgress || sr.error || sr.results.length > 0;

                    }).length > 0;
                };

                // search results visible when false
                $scope.searchHidden = false;

                // hide the search results
                $scope.hideSearch = function hideSearch() {
                    $scope.searchHidden = true;
                };

                // call onSelect function if provided.
                $scope.selectResult = function selectResult(result, cb) {
                    if (cb) {
                        cb.call(null, result);
                    }
                    $scope.hideSearch();
                    $scope.searchInput = result.text;
                };

                // set focus to a specific search result.  Need to pass the providerId of the result so we can locate it in the DOM
                var focusResult = function focusResult(result, providerId) {
                    var index = $scope.searchResults[providerId].results.indexOf(result);
                    var searchResultDOM = elem.find('div[data-provider-id=\'' + providerId + '\'] .osel-search-result[data-search-result-index=\'' + index + '\']');
                    searchResultDOM[0].focus();
                };

                // sets focus to the search input box, and puts cursor to the end of text
                var focusSearchInput = function focusSearchInput() {
                    var input = elem.find('input.osel-search');
                    input[0].focus();

                    // use the selection properties
                    if (input[0].selectionStart) {
                        $timeout(function() {
                            input[0].selectionStart = input[0].selectionEnd = input[0].value.length;
                        });
                    } else {
                        // otherwise try this hack
                        $timeout(function() {
                            input.val(input.val());
                        });
                    }
                };

                // keydown handler from the search input box
                $scope.keyFromInput = function keyFromInput($event) {
                    if ($event.keyCode === 40) {

                        var orderedResults = $filter('orderObjectBy')($scope.searchResults, 'received').filter(function(e) {
                            return !e.error && !e.inProgress && e.results.length > 0;
                        });
                        try {
                            focusResult(orderedResults[0].results[0], orderedResults[0].providerId);
                            $event.preventDefault();
                        } catch (e) {}
                    }
                };

                // helper function to find neighbouring search result of a given result
                // takes into account top/bottom and left/right (doesn't exceed length of list)
                var getNeighbour = function getNeighbour(searchResultElement, xOffset, yOffset) {
                    // make the ordered array, as is displayed to the user
                    var orderedResults = $filter('orderObjectBy')($scope.searchResults, 'received').filter(function(e) {
                        return !e.error && !e.inProgress && e.results.length > 0;
                    });

                    // create another array of only the provider IDs
                    var orderedProviderIds = orderedResults.map(function(column) {
                        return column.providerId;
                    });

                    var currentProviderId = $(searchResultElement).attr('data-provider-id');
                    var currentProviderIndex = orderedProviderIds.indexOf(currentProviderId);

                    var neighbourProviderId = orderedProviderIds[currentProviderIndex + xOffset]; // add the offset to go left or right
                    if (currentProviderIndex + xOffset < 0) {
                        neighbourProviderId = orderedProviderIds[0];
                    } else if (currentProviderIndex + xOffset > orderedResults.length - 1) {
                        neighbourProviderId = orderedProviderIds[orderedResults.length - 1];
                    } else if (orderedResults[neighbourProviderId] && (orderedResults[neighbourProviderId].inProgress || orderedResults[neighbourProviderId].error)) {
                        neighbourProviderId = currentProviderId;
                    }

                    var currentResultIndex = $window.parseInt($(searchResultElement).attr('data-search-result-index'));
                    var neighbourResultIndex = currentResultIndex + yOffset;
                    if (currentResultIndex + yOffset < 0) {
                        neighbourResultIndex = 0;
                    } else if (currentResultIndex + yOffset > $scope.searchResults[neighbourProviderId].results.length - 1) {
                        neighbourResultIndex = $scope.searchResults[neighbourProviderId].results.length - 1;
                    }

                    return {
                        result: $scope.searchResults[neighbourProviderId].results[neighbourResultIndex],
                        providerId: neighbourProviderId
                    };
                };


                // move up/down/left/right from current focused search result
                // also listen for enter/esc to select result or hide search results
                $scope.keyFromSearchResult = function keyFromSearchResult($event, result, providerId, onSelect) {

                    var neighbour;

                    if ($event.keyCode === 37) { // left
                        neighbour = getNeighbour($window.document.activeElement, -1, 0);
                        focusResult(neighbour.result, neighbour.providerId);
                        $event.preventDefault();
                    } else if ($event.keyCode === 39) { // right
                        neighbour = getNeighbour($window.document.activeElement, 1, 0);
                        focusResult(neighbour.result, neighbour.providerId);
                        $event.preventDefault();
                    } else if ($event.keyCode === 40) { // down
                        neighbour = getNeighbour($window.document.activeElement, 0, 1);
                        focusResult(neighbour.result, neighbour.providerId);
                        $event.preventDefault();
                    } else if ($event.keyCode === 38) { // up
                        if ($scope.searchResults[providerId].results.indexOf(result) === 0) {
                            focusSearchInput();
                        } else {
                            neighbour = getNeighbour($window.document.activeElement, 0, -1);
                            focusResult(neighbour.result, neighbour.providerId);
                        }
                        $event.preventDefault();
                    } else if ($event.keyCode === 13) { // enter
                        $scope.selectResult(result, onSelect);
                    } else if ($event.keyCode === 27) { // escape
                        $scope.searchHidden = true;
                    }

                    return neighbour;
                };

                // hide search results if user clicks outdside the searchbox or outside the search results
                angular.element(document.querySelector('html')).on('click', function(event) {
                    var el = angular.element(event.target);
                    if (el && !(closestByClass(el[0], 'osel-search') || closestByClass(el[0], 'osel-search-results'))) {
                        $timeout(function() {
                            $scope.searchHidden = true;
                        });
                    }
                });

                function closestByClass(el, className) {
                    while (! (el.classList.contains(className))) {
                      el = el.parentNode;

                      if (!el || !el.classList) {
                        return null;
                      }
                    }

                    return el;
                  }

            }
        };
    };
    angular.module('osel-search').directive('oselSearch', dependencies.concat([oselSearchDirective]));
})();
