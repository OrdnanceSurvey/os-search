var app = angular.module('example-app', ['osel-search']);

app.controller('example-ctrl', ['$scope', function ($scope) {

  $scope.searchConfig = {
    placeholder: 'Search',
    buffer: 200,
    providers: [
      {
        title: 'Text Conversion',
        footer: 'Results from: inline javascript',
        providers: [
          {
            id: 'ECHO_UPPERCASE',
            title: 'To uppercase x3',
            fn: function (term) {
              var upper = term;
              try {
                upper = term.toUpperCase();
              } catch (e) {
              }

              // return an array to illustrate how transformResponse can be used
              return [{
                text: upper
              }, {
                text: upper
              }, {
                text: upper
              }];
            },
            transformResponse: function (response) {
              // return an object with a results property containing the array
              return {
                results: response
              };
            },
            onSelect: function (result, hideSearch) {
              console.log('selected an UPPERCASE result', result);
            }
          },
          {
            id: 'ECHO_LOWERCASE',
            title: 'To lowercase x5',
            fn: function (term) {
              var lower = term;
              try {
                lower = term.toLowerCase();
              } catch (e) {
              }

              // return an array to illustrate how transformResponse can be used
              return [{
                text: lower
              }, {
                text: lower
              }, {
                text: lower
              }, {
                text: lower
              }, {
                text: lower
              }];
            },
            transformResponse: function (response) {
              // return an object with a results property containing the array
              return {
                results: response
              };
            },
            onSelect: function (result, hideSearch) {
              console.log('selected a LOWERCASE result', result);
            }
          }
        ]
      }
      ,

      {
        title: 'Surround',
        providers: [{
          id: 'SURROUND_1',
          title: 'Surrounded by: =',
          fn: function (term) {
            var upper = term;
            // return an array to illustrate how transformResponse can be used
            return [{
              text: '=' + upper + '='
            }, {
              text: '==' + upper + '=='
            }, {
              text: '===' + upper + '==='
            },{
              text: '====' + upper + '====='
            },{
              text: '=====' + upper + '====='
            }];
          },
          transformResponse: function (response) {
            // return an object with a results property containing the array
            return {
              results: response
            };
          },
          onSelect: function (result, hideSearch) {
            console.log('selected an SURROUND_1 result', result);
          }
        },
          {
            id: 'SURROUND_2',
            title: 'Surrounded by: _',
            fn: function (term) {
              var upper = term;
              // return an array to illustrate how transformResponse can be used
              return [{
                text: '_' + upper + '_'
              }, {
                text: '__' + upper + '__'
              }, {
                text: '___' + upper + '___'
              },{
                text: '____' + upper + '_____'
              },{
                text: '_____' + upper + '_____'
              }];
            },
            transformResponse: function (response) {
              // return an object with a results property containing the array
              return {
                results: response
              };
            },
            onSelect: function (result, hideSearch) {
              console.log('selected an SURROUND_2 result', result);
            }
          },
          {
            id: 'SURROUND_3',
            title: 'Surrounded by: #',
            fn: function (term) {
              var upper = term;
              // return an array to illustrate how transformResponse can be used
              return [{
                text: '#' + upper + '#'
              }, {
                text: '##' + upper + '##'
              }, {
                text: '###' + upper + '###'
              },{
                text: '####' + upper + '#####'
              },{
                text: '#####' + upper + '#####'
              }];
            },
            transformResponse: function (response) {
              // return an object with a results property containing the array
              return {
                results: response
              };
            },
            onSelect: function (result, hideSearch) {
              console.log('selected an SURROUND_3 result', result);
            }
          }]

      }
    ]
  };

}]);
