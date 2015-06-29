## os-search
AngularJS implementation of a flexible search box, by OS Elements

## Demo
example-requirejs/index.html

Live demo coming soon!

## Installation and Requirements
**Note:** os-search uses AngularJS 1.2.x to maintain IE8 support.

Project files are available through Bower:
```
bower install os-search --save-dev
```

### Dependencies
Include os-search.js before [`angular`](https://github.com/angular/angular.js) and [`rx`](https://github.com/Reactive-Extensions/RxJS).
Include os-search-templates.js after os-search.js.  If you want, you can override the template by injecting your own HTML into angular's $templateCache with they key 'templates/os-search.html' and leaving out os-search-templates.js
```html
<script src="angular.js"></script>
<script src="rx.js"></script>
<script src="bower_components/os-search/dist/os-search.js"></script><!-- load os-search after angular and rx.js -->
```


### Add `os-search` as an AngularJS module dependency
```javascript
angular.module('myModule', ['os-search']);
```

### RequireJS
You can easily use os-search with RequireJS.  Take a look at the [example](example-requirejs/config.js), or make your requirejs config look like this:
```javascript
requirejs({
    paths: {
        'angular': '../bower_components/angular/angular',
        'rx': '../bower_components/rxjs/dist/rx.all', // bower install rxjs --save-dev
        'os-search': '../dist/os-search',
        'os-search-templates': '../dist/os-search-templates'
    },
    shim: {
        'angular': {
            exports: 'angular' // tell requirejs that angular exports a global
        },
        'os-search-templates': {
            deps: ['angular', 'os-search'] // make sure os-search module is loaded before the templates
        },
        'os-search': {
            deps: ['angular']
        }
    }
});

define('app', ['angular', 'os-search', 'os-search-templates'], function(angular) {

    var app = angular.module('my-app', ['os-search']);

    // ...
});

```

### IE8 compatibility
Older browsers need polyfills for some functionality.  We recommend using [Placeholders.js](https://github.com/jamesallardice/Placeholders.js/) for polyflling HTML5 placeholder attribute.
`bower install placeholders --save-dev`