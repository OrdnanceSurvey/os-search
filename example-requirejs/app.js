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
                {
                    id: 'NAMES',
                    method: 'GET',
                    params: {
                        q: '%s'
                    },
                    url: '/api/search/names',
                    title: 'Places'
                },
                {
                    id: 'ADDRESSES',
                    method: 'GET',
                    params: {
                        q: '%s'
                    },
                    url: '/api/search/addresses',
                    title: 'Addresses'
                }
            ]
        };

    }]);

    return app;
});