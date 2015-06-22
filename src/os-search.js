define(['angular', 'text!./templates/os-search.html'], function(angular, template) {
    var module = angular.module('os-search', []);

    console.log('loaded os-search module');

    module.directive('osSearch', [function() {
        return {
            template: template,
            link: function($scope, elem, attrs) {
                console.log('created os-search on', elem);
                //elem.html('os-search inserted this DOM');
            }
        }
    }]);

    return module;
});