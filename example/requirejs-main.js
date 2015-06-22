requirejs({
    paths: {
        'angular': '../bower_components/angular/angular'
    },
    shim: {
        'angular': {
            exports: 'angular'
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