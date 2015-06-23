requirejs({
    paths: {
        'angular': '../bower_components/angular/angular',
        'os-search': '../dist/os-search',
        'os-search-templates': '../dist/os-search-templates'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'os-search-templates': {
            deps: ['os-search']
        }
    }
});
requirejs(['angular', 'app'], function(angular, app) {
    // bootstrap app after onReady event
    angular.element().ready(function () {
        angular.bootstrap(angular.element(document.body), [app.name], {
            strictDi: true // production mode - true to catch DI errors in development
        });
        console.log('bootstrapped app ' + app.name + ' with requirejs');
    });
});