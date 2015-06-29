## os-search
AngularJS implementation of a flexible search box, by OS Elements

## Demo
example-requirejs/index.html

Live demo coming soon!

## Installation and Requirements
**Note:** os-search uses AngularJS 1.2.x to maintain IE8 support.

Project files are available through Bower:
```
bower install os-search
```



### AMD dependencies
os-search expects 'angular' to be loaded and available as an AMD module.  Take a look at the example folder, or add this to your requirejs paths config:
```javascript
requirejs.config({
    paths: {
        angular: '../bower_components/angular/angular.min'
    },
    shim: {
        angular: { exports: 'angular' } // tell RequireJS that AngularJS exports a global property named 'angular'
    }
});
```


### Add `os-search` as an AngularJS module dependency
```javascript
angular.module('myModule', ['os-search']);
```

### IE8 compatibility
Your application must manually include [Placeholders.js](https://github.com/jamesallardice/Placeholders.js/) if you wish to polyfill the HTML5 placeholder attribute