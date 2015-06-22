define('text',{load: function(id){throw new Error("Dynamic load not allowed: " + id);}});

define('text!templates/os-search.html',[],function () { return '<input type="text" autocomplete="on" placeholder="qwerty" />';});

define('os-search',['angular', 'text!./templates/os-search.html'], function(angular, template) {
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

require(["os-search"]);
