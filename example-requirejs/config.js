requirejs({
    paths: {
        'angular': '../bower_components/angular/angular',
        'jquery': '../bower_components/jquery/dist/jquery',

        'rx': '../bower_components/rxjs/dist/rx.all',
        'os-search': '../dist/os-search',
        'os-search-templates': '../dist/os-search-templates'
    },
    shim: {
        'angular': {
            deps: ['jquery'],
            exports: 'angular'
        },
        'os-search-templates': {
            deps: ['angular', 'os-search']
        },
        'os-search': {
            deps: ['angular']
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