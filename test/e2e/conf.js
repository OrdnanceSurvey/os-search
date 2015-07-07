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
    return capabilities;
};
exports.config = {
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
//seleniumAddress: 'http://localhost:4444/wd/hub',

    rootElement: 'body',
    //allScriptsTimeout: 40000,
    //getPageTimeout: 40000,

    allScriptsTimeout: 60000,
    getPageTimeout: 60000,

    framework: 'jasmine',

    baseUrl: 'http://localhost:9001/',

    multiCapabilities: [
        //capabilitiesForBrowser('chrome'),


        // Windows XP
        capabilitiesForBrowser('internet explorer', '8.0', 'Windows XP'),
        capabilitiesForBrowser('firefox', 'dev', 'Windows XP'),
        capabilitiesForBrowser('firefox', 'beta', 'Windows XP'),
        capabilitiesForBrowser('chrome', 'dev', 'Windows XP'),
        capabilitiesForBrowser('chrome', 'beta', 'Windows XP'),

        // Windows 7
        capabilitiesForBrowser('internet explorer', '8.0', 'Windows 7'),
        capabilitiesForBrowser('internet explorer', '9.0', 'Windows 7'),
        capabilitiesForBrowser('internet explorer', '10.0', 'Windows 7'),
        capabilitiesForBrowser('internet explorer', '11.0', 'Windows 7'),
        capabilitiesForBrowser('firefox', 'dev', 'Windows 7'),
        capabilitiesForBrowser('firefox', 'beta', 'Windows 7'),
        capabilitiesForBrowser('chrome', 'dev', 'Windows 7'),
        capabilitiesForBrowser('chrome', 'beta', 'Windows 7'),

        // Windows 8
        capabilitiesForBrowser('internet explorer', '10.0', 'Windows 8'),
        capabilitiesForBrowser('firefox', 'dev', 'Windows 8'),
        capabilitiesForBrowser('firefox', 'beta', 'Windows 8'),
        capabilitiesForBrowser('chrome', 'dev', 'Windows 8'),
        capabilitiesForBrowser('chrome', 'beta', 'Windows 8'),

        // Windows 8.1
        capabilitiesForBrowser('internet explorer', '11.0', 'Windows 8.1'),
        capabilitiesForBrowser('firefox', 'dev', 'Windows 8.1'),
        capabilitiesForBrowser('firefox', 'beta', 'Windows 8.1'),
        capabilitiesForBrowser('chrome', 'dev', 'Windows 8.1'),
        capabilitiesForBrowser('chrome', 'beta', 'Windows 8.1')
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