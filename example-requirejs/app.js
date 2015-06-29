define('app', ['angular', 'os-search', 'os-search-templates'], function(angular) {

    var app = angular.module('tiny-app', ['os-search']);

    app.controller('my-ctrl', ['$scope', function($scope) {
        $scope.message = 'Hello World!';

        $scope.search = {
            providers: [
                {
                    id: 'NAMES',
                    method: 'GET',
                    params: {
                        q: '%s'
                    },
                    url: '/mapmaker/api/search/names',
                    title: 'Places'
                },
                {
                    id: 'ADDRESSES',
                    method: 'GET',
                    params: {
                        q: '%s'
                    },
                    url: '/mapmaker/api/search/addresses',
                    title: 'Addresses'
                }
            ]
        };

    }]);

    return app;
});