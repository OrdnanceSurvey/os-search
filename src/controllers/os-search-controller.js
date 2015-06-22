define(['angular'], function osSearchControllerDefine(angular) {
    var dependencies = ['$scope'];

    var osSearchController = function($scope) {
        $scope.alphabet = 'abcdefghijklmnopqrstuvwxyz';
    };

    return dependencies.concat([osSearchController]);
});