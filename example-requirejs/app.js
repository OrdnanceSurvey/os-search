define('app', ['angular', 'os-search', 'os-search-templates'], function(angular) {

    var app = angular.module('tiny-app', ['os-search']);

    app.directive('jsonText', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attr, ngModel) {
                function into(input) {
                    return JSON.parse(input);
                }
                function out(data) {
                    return JSON.stringify(data,null,4);
                }
                ngModel.$parsers.push(into);
                ngModel.$formatters.push(out);

                scope.$watch('search', function(newVal) {
                    while(elem.outerHeight() < elem[0].scrollHeight + parseFloat(elem.css("borderTopWidth")) + parseFloat(elem.css("borderBottomWidth"))) {
                        elem.height(elem.height()+1);
                    }
                });
            }
        };
    });

    app.controller('my-ctrl', ['$scope', function($scope) {

        $scope.searchConfig = {
            providers: [
                //{
                //    id: 'PLACES',
                //    method: 'GET',
                //    params: {
                //        q: '%s'
                //    },
                //    url: '/api/search/places',
                //    title: 'Places'
                //},
                {
                    id: 'ECHO_UPPERCASE',
                    title: 'Convert to uppercase',
                    fn: function(term) {
                        var upper = term;
                        try {
                            upper = term.toUpperCase();
                        } catch (e) {}

                        // return an array to illustrate how transformResponse can be used
                        return [{
                            text: upper
                        }]
                    },
                    transformResponse: function(response) {
                        // return an object with a results property containing the array
                        return {
                            results: response
                        };
                    }
                }
            ]
        };

    }]);

    return app;
});