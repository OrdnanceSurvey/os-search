describe('example-requirejs', function() {

    it('should show results when searching', function() {
        browser.get('example-requirejs/index.html');

        element(by.model('searchInput')).sendKeys('abcdefg');

        var searchResults = by.css('.osel-search-result');
        var searchColumns = by.css('.osel-search-result-column');

        browser.wait(function() {
            return browser.driver.isElementPresent(searchColumns);
        }, 10000);
        //expect($p.isElementPresent(logout)).toBeTruthy();

        expect(element.all(searchResults).count()).toBe(8);
    });
});