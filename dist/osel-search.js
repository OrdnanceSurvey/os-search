/**
 * @license osel-search - v0.0.3 - 06-07-2015
 * (c) 2015 Ordnance Survey Limited
 * License: MIT
 */
// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

;(function (root, factory) {
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  var root = (objectTypes[typeof window] && window) || this,
    freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
    freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
    moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
    freeGlobal = objectTypes[typeof global] && global;
  
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  // Because of build optimizers
  if (typeof define === 'function' && define.amd) {
    define(['rx', 'angular', 'exports'], function (Rx, angular, exports) {
      root.Rx = factory(root, exports, Rx, angular);
      return root.Rx;
    });
  } else if (typeof module == 'object' && module && module.exports == freeExports) {
    module.exports = factory(root, module.exports, require('rx'), require('angular'));
  } else {
    root.Rx = factory(root, {}, root.Rx, root.angular);
  }
}(this, function (global, exp, Rx, angular, undefined) {

  var observable = Rx.Observable,
    observableProto = observable.prototype,
    observableCreate = observable.create,
    disposableCreate = Rx.Disposable.create,
    SingleAssignmentDisposable = Rx.SingleAssignmentDisposable,
    CompositeDisposable = Rx.CompositeDisposable,
    AnonymousObservable = Rx.AnonymousObservable,
    Scheduler = Rx.Scheduler,
    noop = Rx.helpers.noop;

  // Utilities
  var toString = Object.prototype.toString,
    slice = Array.prototype.slice;

  /**
   * @ngdoc overview
   * @name rx
   *
   * @description
   * The `rx` module contains essential components for reactive extension bindings
   * for Angular apps.
   *
   * Installation of this module is just a cli command away:
   *
   * <pre>
   * bower install rx-angular
   * <pre>
   *
   * Simply declare it as dependency of your app like this:
   *
   * <pre>
   * var app = angular.module('myApp', ['rx']);
   * </pre>
   */
  var rxModule = angular.module('rx', []);

  /**
   * @ngdoc service
   * @name rx.rx
   *
   * @requires $window
   *
   * @description
   * Factory service that exposes the global `Rx` object to the Angular world.
   */
  rxModule.factory('rx', ['$window', function($window) {
    $window.Rx || ($window.Rx = Rx);
    return $window.Rx;
  }]);

  /**
  * @ngdoc service
  * @name rx.observeOnSope
  *
  * @requires rx.rx
  *
  * @description
  * An observer function that returns a function for a given `scope`,
  * `watchExpression` and `objectEquality` object. The returned function
  * delegates to an Angular watcher.
  *
  * @param {object} scope Scope object.
  * @param {(string|object)} watchExpression Watch expression.
  * @param {boolean} objectEquality Object to compare for object equality.
  *
  * @return {function} Factory function that creates obersables.
  */
  rxModule.factory('observeOnScope', ['rx', function(rx) {
    return function(scope, watchExpression, objectEquality) {
      return rx.Observable.create(function (observer) {
        // Create function to handle old and new Value
        function listener (newValue, oldValue) {
          observer.onNext({ oldValue: oldValue, newValue: newValue });
        }

        // Returns function which disconnects the $watch expression
        return scope.$watch(watchExpression, listener, objectEquality);
      });
    };
  }]);

  observableProto.safeApply = function($scope, fn){

    fn = angular.isFunction(fn) ? fn : noop;

    return this['do'](function (data) {
      ($scope.$$phase || $scope.$root.$$phase) ? fn(data) : $scope.$apply(function () {
        fn(data);
      });
    });
  };

  rxModule.config(['$provide', function($provide) {
    /**
     * @ngdoc service
     * @name rx.$rootScope
     *
     * @requires $delegate
     *
     * @description
     * `$rootScope` decorator that extends the existing `$rootScope` service
     * with additional methods. These methods are Rx related methods, such as
     * methods to create observables or observable functions.
     */
    $provide.decorator('$rootScope', ['$delegate', function($delegate) {

      Object.defineProperties($delegate.constructor.prototype, {
        /**
         * @ngdoc property
         * @name rx.$rootScope.$toObservable
         *
         * @description
         * Provides a method to create observable methods.
         */
        '$toObservable': {
          /**
           * @ngdoc function
           * @name rx.$rootScope.$toObservable#value
           *
           * @description
           * Creates an observable from a watchExpression.
           *
           * @param {(function|string)} watchExpression A watch expression.
           * @param {boolean} objectEquality Compare object for equality.
           *
           * @return {object} Observable.
           */
          value: function(watchExpression, objectEquality) {
            var scope = this;
            return observableCreate(function (observer) {
              // Create function to handle old and new Value
              function listener (newValue, oldValue) {
                observer.onNext({ oldValue: oldValue, newValue: newValue });
              }

              // Returns function which disconnects the $watch expression
              var disposable = Rx.Disposable.create(scope.$watch(watchExpression, listener, objectEquality));

              scope.$on('$destroy', function(){
                disposable.dispose();
              });

              return disposable;
            }).publish().refCount();
          },
          /**
           * @ngdoc property
           * @name rx.$rootScope.$toObservable#enumerable
           *
           * @description
           * Enumerable flag.
           */
          enumerable: false,
          configurable: true,
          writable: true
        },
        /**
         * @ngdoc property
         * @name rx.$rootScope.$eventToObservable
         *
         * @description
         * Provides a method to create observable methods.
         */
        '$eventToObservable': {
          /**
           * @ngdoc function
           * @name rx.$rootScope.$eventToObservable#value
           *
           * @description
           * Creates an Observable from an event which is fired on the local $scope.
           * Expects an event name as the only input parameter.
           *
           * @param {string} event name
           *
           * @return {object} Observable object.
           */
          value: function(eventName) {
            var scope = this;
            return observableCreate(function (observer) {
              function listener () {
                observer.onNext({
                  'event': arguments[0],
                  'additionalArguments': slice.call(arguments, 1)
                });
              }

              // Returns function which disconnects from the event binding
              var disposable = disposableCreate(scope.$on(eventName, listener));

              scope.$on('$destroy', function(){
                disposable.isDisposed || disposable.dispose();
              });

              return disposable;
            }).publish().refCount();
          },
          /**
           * @ngdoc property
           * @name rx.$rootScope.$eventToObservable#enumerable
           *
           * @description
           * Enumerable flag.
           */
          enumerable: false,
          configurable: true,
          writable: true
        },
        /**
         * @ngdoc property
         * @name rx.$rootScope.$createObservableFunction
         *
         * @description
         * Provides a method to create obsersables from functions.
         */
        '$createObservableFunction': {
          /**
           * @ngdoc function
           * @name rx.$rootScope.$createObservableFunction#value
           *
           * @description
           * Creates an observable from a given function.
           *
           * @param {string} functionName A function name to observe.
           * @param {function} listener A listener function that gets executed.
           *
           * @return {function} Remove listener function.
           */
          value: function(functionName, listener) {
            var scope = this;

            return observableCreate(function (observer) {
              scope[functionName] = function () {
                if (listener) {
                  observer.onNext(listener.apply(this, arguments));
                } else if (arguments.length === 1) {
                  observer.onNext(arguments[0]);
                } else {
                  observer.onNext(arguments);
                }
              };

              return function () {
                // Remove our listener function from the scope.
                delete scope[functionName];
              };
            }).publish().refCount();
          },
          /**
           * @ngdoc property
           * @name rx.$rootScope.$createObservableFunction#enumerable
           *
           * @description
           * Enumerable flag.
           */
          enumerable: false,
          configurable: true,
          writable: true
        },
        /**
         * @ngdoc function
         * @name rx.$rootScope.$digestObservables#value
         *
         * @description
         * Digests the specified observables when they produce new values.
         * The scope variable specified by the observable's key
         *   is set to the new value.
         *
         * @param {object} obj A map where keys are scope properties
         *   and values are observables.
         *
         * @return {boolean} Reference to obj.
         */
        '$digestObservables': {
          value: function(observables) {
            var scope = this;
            return angular.map(observables, function(observable, key) {
              return observable.digest(scope, key);
            }).publish().refCount();
          },
          /**
           * @ngdoc property
           * @name rx.$rootScope.digestObservables#enumerable
           *
           * @description
           * Enumerable flag.
           */
          enumerable: false,
          configurable: true,
          writable: true
        }
      });

      return $delegate;
    }]);
  }]);

  rxModule.run(['$parse', function($parse) {

    observableProto.digest = function($scope, prop) {
      var source = this;
      return new AnonymousObservable(function (observer) {
        var propSetter = $parse(prop).assign;

        var m = new SingleAssignmentDisposable();

        m.setDisposable(source.subscribe(
          function (e) {
            if (!$scope.$$phase) {
              $scope.$apply(propSetter($scope, e));
            } else {
              propSetter($scope, e);
            }
          },
          observer.onError.bind(observer),
          observer.onCompleted.bind(observer)
        ));

        $scope.$on('$destroy', m.dispose.bind(m));

        return m;
      });
    };
  }]);

  var ScopeScheduler = Rx.ScopeScheduler = (function () {

    var now = Date.now || (+new Date());

    function scheduleNow(state, action) {
      var scheduler = this,
        disposable = new SingleAssignmentDisposable();

      safeApply(disposable, scheduler, action, state);

      return disposable;
    }

    function scheduleRelative(state, dueTime, action) {
      var scheduler = this,
        dt = Rx.Scheduler.normalize(dueTime);

      if (dt === 0) {
        return scheduler.scheduleWithState(state, action);
      }

      var disposable = new SingleAssignmentDisposable();
      var id = setTimeout(function () {
        safeApply(disposable, scheduler, action, state);
      }, dt);

      return new CompositeDisposable(disposable, disposableCreate(function () {
        clearTimeout(id);
      }));
    }

    function safeApply(disposable, scheduler, action, state) {
      function fn() {
        !disposable.isDisposed && disposable.setDisposable(action(scheduler, state));
      }

      (scheduler._scope.$$phase || scheduler._scope.$root.$$phase)
        ? fn()
        : scheduler._scope.$apply(fn);
    }

    function scheduleAbsolute(state, dueTime, action) {
      return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
    }

    return function (scope) {
      var scheduler = new Scheduler(now, scheduleNow, scheduleRelative, scheduleAbsolute);
      scheduler._scope = scope;
      return scheduler;
    }
  }());

  var manageScope = Rx.manageScope = function ($scope) {

    return function(observer) {

        var source = observer;

        return new AnonymousObservable(function (observer) {

            var m = new SingleAssignmentDisposable();

            var scheduler = Rx.ScopeScheduler($scope);

            m.setDisposable(source
                .observeOn(scheduler)
                .subscribe(
                    observer.onNext.bind(observer),
                    observer.onError.bind(observer),
                    observer.onCompleted.bind(observer)
            ));

            $scope.$on("$destroy", function() {
                m.dispose();
                delete m;
            });

            return m;
        });
      }
  }


  return Rx;
}));
'use strict';

(
  function(angular) {
    return angular
      .module('ngOrderObjectBy', [])
      .filter('orderObjectBy', function() {
        return function (items, field, reverse) {
          var filtered = [];
          angular.forEach(items, function(item) {
            filtered.push(item);
          });
          function index(obj, i) {
            return obj[i];
          }
          filtered.sort(function (a, b) {
            var comparator;
            var reducedA = field.split('.').reduce(index, a);
            var reducedB = field.split('.').reduce(index, b);
            if (reducedA === reducedB) {
              comparator = 0;
            } else {
              comparator = (reducedA > reducedB ? 1 : -1);
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

var module = angular.module('osel-search', ['rx', 'ngOrderObjectBy']);
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
                var config = {
                    params: angular.copy(provider.params),
                    data: angular.copy(provider.data),
                    dataType: provider.dataType,
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
                        observer.onNext(fn.call(this, term));
                        observer.onCompleted();
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
                        $scope.searchResults[providerObservable.providerId].error = error.data.error || error.data; // TODO check this logic with a real server error
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

            // call onSelect function if provided.  Pass the hideSearch handler so the function may call it
            $scope.selectResult = function selectResult(result, cb) {
                if (cb) {
                    cb.call(null, result, $scope.hideSearch);
                }
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

                } else if ($event.keyCode === 39) { // right
                    neighbour = getNeighbour($window.document.activeElement, 1, 0);
                    focusResult(neighbour.result, neighbour.providerId);

                } else if ($event.keyCode === 40) { // down
                    neighbour = getNeighbour($window.document.activeElement, 0, 1);
                    focusResult(neighbour.result, neighbour.providerId);

                } else if ($event.keyCode === 38) { // up
                    if ($scope.searchResults[providerId].results.indexOf(result) === 0) {
                        focusSearchInput();
                    } else {
                        neighbour = getNeighbour($window.document.activeElement, 0, -1);
                        focusResult(neighbour.result, neighbour.providerId);
                    }
                } else if ($event.keyCode === 13) { // enter
                    $scope.selectResult(result, onSelect);
                } else if ($event.keyCode === 27) { // escape
                    $scope.searchHidden = true;
                }

                return neighbour;
            };

            // hide search resutls if user clicks outdside the searchbox or outside the search results
            $('html').on('click', function(event) {
                var el = $(event.target);
                if (!(el.closest('.osel-search').length || el.closest('.osel-search-results').length)) {
                    $timeout(function() {
                        $scope.searchHidden = true;
                    });
                }
            });

        }
    };
};
angular.module('osel-search').directive('oselSearch', dependencies.concat([oselSearchDirective]));
