(function () {
  var dependencies = ['observeOnScope', '$http', 'rx'];
  var oselSearchDirective = function oselSearchDirective(observeOnScope, $http, rx) {
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
        $scope.allProviders = $scope.options.providers.reduce(function (arr, providerOrGroup) {
          if (providerOrGroup.hasOwnProperty('providers')) {
            return arr.concat(providerOrGroup.providers);
          } else {
            arr.push(providerOrGroup);
            return arr;
          }
        }, []);
        $scope.options.placeholder = $scope.options.hasOwnProperty('placeholder') ? $scope.options.placeholder : 'Start typing to search';
        $scope.searchResults = {};

        // turn $scope.allProviders into a hashmap, with provider.id as the keys
        $scope.searchProviders = $scope.allProviders.reduce(function (providerHashMap, provider) {
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

          return rx.Observable.create(function (observer) {
            try {

              var result = fn.call(this, term);

              // if result is a promise, then listen for resolve/reject.  Otherwise, use value immediately
              if (angular.isFunction(result.then)) {
                result.then(function (response) {
                  observer.onNext(response);
                  observer.onCompleted();
                }).catch(function (response) {
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
          $scope.allProviders.forEach(function (provider) {
            $scope.searchResults[provider.id] = $scope.searchResults[provider.id] || {};
            $scope.searchResults[provider.id].providerId = provider.id; // need to save the id because orderObjectBy changes Object into an Array
            $scope.searchResults[provider.id].results = [];
          });

          // only search on 3+ characters
          return term && term.length && term.length > 2;
        }).subscribe(function (term) {

          var observables = $scope.allProviders.map(function (provider) {
            $scope.$apply(function () {
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


          observables.forEach(function (providerObservable) {
            providerObservable.subscribe(function (response) {

              // changing scope from outside angular, so $apply
              $scope.$apply(function() {
                // call tranformResponse function if provided
                if (providerObservable.config.transformResponse) {
                  response = providerObservable.config.transformResponse.call(this, response);
                }

                // check that response is for the current search term
                if ($scope.searchInput === providerObservable.term) {
                  $scope.searchResults[providerObservable.providerId].inProgress = false;
                  $scope.searchResults[providerObservable.providerId].results = response.results;
                  $scope.searchResults[providerObservable.providerId].error = "";
                  $scope.searchResults[providerObservable.providerId].sent = providerObservable.sent;
                  $scope.searchResults[providerObservable.providerId].received = new Date();

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

        // call onSelect function if provided.
        $scope.selectResult = function selectResult(result, cb) {
          if (cb) {
            cb.call(null, result);
          }
          $scope.searchInput = result.text;
        };

        $scope.aggregateLength = function aggregateLength(column) {
          return column.providers.reduce(function (total, provider) {
            if (provider && $scope.searchResults[provider.id]) {
              return total + ($scope.searchResults[provider.id].results || []).length;
            }
            return total;
          }, 0);
        };

      }
    };
  };
  angular.module('osel-search').directive('oselSearch', dependencies.concat([oselSearchDirective]));
})();
