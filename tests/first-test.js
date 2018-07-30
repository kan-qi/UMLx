require('chromedriver');
var webdriver = require('selenium-webdriver');

// https://www.npmjs.com/package/chromedriver
// https://stackoverflow.com/questions/27733731/passing-requirechromedriver-path-directly-to-selenium-webdriver
// more package will be added as per need
var driver = new webdriver.Builder().
withCapabilities(webdriver.Capabilities.chrome()).
build();

try{
    driver.get('http:/localhost:8081/');
    // driver.findElement(webdriver.By.name('q')).sendKeys('simple programmer');
    // driver.findElement(webdriver.By.name('btnG')).click();
}catch (err){
    console.log(err);
}
driver.quit();