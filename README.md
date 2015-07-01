## osel-search
AngularJS implementation of a flexible search box, by OS Elements

## Demo
example-requirejs/index.html

Live demo coming soon!

## Installation and Requirements
**Note:** osel-search uses AngularJS 1.2.x to maintain IE8 support.

Project files are available through Bower:
```
bower install osel-search --save-dev
```

### Dependencies
Include osel-search.js before [`angular`](https://github.com/angular/angular.js) and [`rx`](https://github.com/Reactive-Extensions/RxJS).
Include osel-search-templates.js after osel-search.js.  If you want, you can override the template by injecting your own HTML into angular's $templateCache with they key 'templates/osel-search.html' and leaving out osel-search-templates.js
```html
<script src="angular.js"></script>
<script src="rx.js"></script>
<script src="bower_components/osel-search/dist/osel-search.js"></script><!-- load osel-search after angular and rx.js -->
```

### Add `osel-search` as an AngularJS module dependency
```javascript
angular.module('myModule', ['osel-search']);
```

## Configuration
osel-search can be configured to use any AJAX or Function based provider, just remember to transform the results to match the supported JSON format (see next point).
```javascript
$scope.searchConfig = {
    placeholder: 'Type to search...',
    providers: [
        {   // AJAX based provider
            id: 'NAMES',
            method: 'GET',
            params: { // put an object here to send as query parameters
                q: '%s' // %s is a special value - it will be replaced with the user's search query
            },
            url: '/api/search/names',
            title: 'Places', // friendly name to display
            data: undefined,  // when doing a POST, put an object here to send as form data
            onSelect: function(result, hideSearch) {
                console.log('got result: ' + JSON.stringify(result));
                hideSearch();
            }
        }, {// Function based provider
            id: 'ECHO_UPPERCASE',
            title: 'Echo',
            fn: function(term) {
                var upper = term;
                try {
                    upper = term.toUpperCase();
                } catch (e) {}

                // return an array to illustrate how transformResponse can be used
                return [{
                    text: upper
                }]
            },
            transformResponse: function(response) {
                // return an object with a results property containing the array
                return {
                    results: response.map(function(e) {
                        e.text = e.text + '!'; // add an exclamation mark to each result!
                        return e;
                    })
                };
            },
            onSelect: function(result, hideSearch) {
                console.log('got result: ' + JSON.stringify(result));
                hideSearch();
            }
        }
    ]
}
```
```html
<div osel-search="searchConfig"></div>
```

### Search results JSON format
```javascript
{
    results: [{
        text: 'result 1'
    }, {
        text: 'result 2'
    }, {
        text: 'result 3
    }]
}
```

### RequireJS
You can easily use osel-search with RequireJS.  Take a look at the [example](example-requirejs/config.js), or make your requirejs config look like this:
```javascript
requirejs({
    paths: {
        'angular': '../bower_components/angular/angular',
        'rx': '../bower_components/rxjs/dist/rx.all', // bower install rxjs --save-dev
        'osel-search': '../dist/osel-search',
        'osel-search-templates': '../dist/osel-search-templates'
    },
    shim: {
        'angular': {
            exports: 'angular' // tell requirejs that angular exports a global
        },
        'osel-search-templates': {
            deps: ['angular', 'osel-search'] // make sure osel-search module is loaded before the templates
        },
        'osel-search': {
            deps: ['angular']
        }
    }
});

define('app', ['angular', 'osel-search', 'osel-search-templates'], function(angular) {

    var app = angular.module('my-app', ['osel-search']);

    // ...
});

```

### IE8 compatibility
Older browsers need polyfills for some functionality.  We recommend using [Placeholders.js](https://github.com/jamesallardice/Placeholders.js/) for polyflling HTML5 placeholder attribute.
`bower install placeholders --save-dev`