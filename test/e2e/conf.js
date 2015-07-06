var capabilitiesForBrowser = function capabilitiesForBrowser(browserName, browserVersion) {
    var capabilities = {
        'browserName': browserName,
        'build': process.env.TRAVIS_BUILD_NUMBER,
        'name': process.env.CIRCLE_PROJECT_USERNAME + '-' + process.env.CIRCLE_PROJECT_REPONAME + '-' + process.env.CIRCLE_BRANCH
    };
    if (browserVersion) {
        capabilities.version = browserVersion;
    }
    return capabilities;
};
exports.config = {
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
//seleniumAddress: 'http://localhost:4444/wd/hub',

    rootElement: 'body',
    //allScriptsTimeout: 40000,
    //getPageTimeout: 40000,



    baseUrl: 'http://localhost:9001/',

    multiCapabilities: [
        capabilitiesForBrowser('chrome')
        //capabilitiesForBrowser('firefox'),
        //capabilitiesForBrowser('safari')
    ],

    // Spec patterns are relative to the current working directly when
    // protractor is called.
    specs: ['specs/**/*spec.js'],

    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 360000,
        includeStackTrace: true
    }
};