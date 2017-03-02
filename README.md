## osel-search
AngularJS implementation of a flexible search box, by OS Elements

Tests: [![Circle CI](https://circleci.com/gh/OrdnanceSurvey/os-search/tree/master.svg?style=svg)](https://circleci.com/gh/OrdnanceSurvey/os-search/tree/master)

## Demo
example/index.html

## Installation and Requirements

Project files are available through npm:
```
npm install osel-search --save-dev
```

### Dependencies
Include osel-search-templates.js after osel-search.js.  If you want, you can override the template by injecting your own HTML into angular's $templateCache with they key 'templates/osel-search.html'.
```html
<script src="angular.js"></script>
<script src="rx.js"></script>
<script src="bower_components/osel-search/dist/osel-search.js"></script><!-- load osel-search after angular and rx.js -->
```

### Add `osel-search` as an AngularJS module dependency
```javascript
angular.module('myModule', ['osel-search']);
```

# Configuration
See example/app.js, or below.  `osel-search` can be configured to use any AJAX or Function based provider, just remember to transform the results to match the supported JSON format (see next point).
```javascript
$scope.searchConfig = {
    placeholder: 'Type to search...',
    
    // an array of providerGroups
    providers: [
        {
            // displayed as the tab name
            title: 'Remote search',
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
                }
            ]
        },
        {
            title: 'JS example',
            providers: [
                {   // Function based provider
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
        text: 'result 3'
    }]
}
```