define(['angular', '../dist/os-search.min'], function(angular) {
    var app = angular.module('tiny-app', ['os-search']);

    app.controller('my-ctrl', ['$scope', function($scope) {
        $scope.message = 'Hello World!';
    }]);

    return app;
});