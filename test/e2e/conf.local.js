var now = Date.now();
var capabilitiesForBrowser = function capabilitiesForBrowser(browserName, browserVersion, platform) {


    var name = 'OrdnanceSurvey:os-search:' + (process.env.CIRCLE_BRANCH ? process.env.CIRCLE_BRANCH : 'local');
    var buildNumber = process.env.CIRCLE_BUILD_NUM || now;

    var capabilities = {
        'browserName': browserName,
        'name': name + (browserName ? '_' + browserName.toLowerCase().replace(' ', '') : '') + (browserVersion ? '_' + browserVersion.toString().toLowerCase().replace(' ', '') : '') + (platform ? '_' + platform.toLowerCase().replace(' ', '') : ''),
        'build': name + ':' + buildNumber
    };
    if (browserVersion) {
        capabilities.version = browserVersion;
    }
    if (platform) {
        capabilities.platform = platform;
    }

    if (browserName === 'phantomjs') {
        capabilities['phantomjs.binary.path'] = './node_modules/phantomjs-prebuilt/bin/phantomjs';
    }

    return capabilities;
};
exports.config = {
    
    seleniumAddress: 'http://localhost:4444/wd/hub',

    rootElement: 'body',
    //allScriptsTimeout: 40000,
    //getPageTimeout: 40000,

    allScriptsTimeout: 60000,
    getPageTimeout: 60000,

    framework: 'jasmine',

    baseUrl: 'http://localhost:9001/',

    multiCapabilities: [
        capabilitiesForBrowser('phantomjs')
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

    //onPrepare: function() {
    //    require('jasmine-reporters');
    //
    //    jasmine.getEnv().addReporter(
    //        new jasmine.JUnitXmlReporter(null, true, true, 'test/reports/e2e.xml')
    //    );
    //}
};