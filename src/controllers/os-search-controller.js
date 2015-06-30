var dependencies = ['$scope'];
var osSearchController = function ($scope) {
    $scope.alphabet = 'abcdefghijklmnopqrstuvwxyz';
};
angular.module('os-search', dependencies.concat([osSearchController])); 