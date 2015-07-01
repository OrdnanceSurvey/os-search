requirejs({
    paths: {
        'angular': '../bower_components/angular/angular',
        'jquery': '../bower_components/jquery/dist/jquery',

        'rx': '../bower_components/rxjs/dist/rx.all',
        'osel-search': '../dist/osel-search',
        'osel-search-templates': '../dist/osel-search-templates'
    },
    shim: {
        'angular': {
            deps: ['jquery'],
            exports: 'angular'
        },
        'osel-search-templates': {
            deps: ['angular', 'osel-search']
        },
        'osel-search': {
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