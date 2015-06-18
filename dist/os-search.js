define('os-search',['angular'], function(angular) {
    var module = angular.module('os-search', []);

    console.log('loaded os-search module');

    module.directive('osSearch', [function() {
        return {
            link: function($scope, elem, attrs) {
                console.log('created os-search on', elem);
            }
        }
    }]);

    return module;
});
