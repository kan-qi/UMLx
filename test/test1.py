'''import time
from selenium import webdriver

driver = webdriver.Chrome('C:\Users\SatyaAnanya\Downloads\chromedriver.exe')  # Optional argument, if not specified will search path.
driver.get('http:/localhost:8081/');
time.sleep(5) # Let the user actually see something!
#search_box = driver.find_element_by_name('q')
#search_box.send_keys('ChromeDriver')
#search_box.submit()
button = driver.find_element_by_class_name('Next_button')
href_data = button.get_attribute('href')
if href_data is None:
  is_clickable = False
time.sleep(5) # Let the user actually see something!
driver.quit()'''

import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

class PythonOrgSearch(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome('path to your chromedriver file')  # Optional argument, if not specified will search path.

    def test_search_in_python_org(self):
        driver = self.driver
        driver.get('http:/localhost:8081/')
        self.assertIn("UMLx", driver.title)
        elem = driver.find_element_by_name("username")
        elem.send_keys("pidikiti.ananya@gmail.com")
        elem1 = driver.find_element_by_name("password")
        elem1.send_keys("pidikiti")
        signupbutton = driver.find_element_by_css_selector('#login-form > input.btn.btn-primary.signUpButton')
        signupbutton.click()
        #elem.send_keys(Keys.RETURN)
        time.sleep(5)
        #repo-stats-chart > div > ul > li.active > a
        #//*[@id="login-form"]/input[3] 
        distr_link=driver.find_element_by_xpath('//*[@id="repo-stats-chart"]/div/ul/li[1]/a')
        distr_link.click()
        time.sleep(5)
        distr_link=driver.find_element_by_xpath('//*[@id="repo-stats-chart"]/div/ul/li[2]/a')
        distr_link.click()
        time.sleep(5)
        distr_link=driver.find_element_by_xpath('//*[@id="repo-stats-chart"]/div/ul/li[3]/a')
        distr_link.click()
        time.sleep(5)
        distr_link=driver.find_element_by_xpath('//*[@id="repo-stats-chart"]/div/ul/li[4]/a')
        distr_link.click()
        time.sleep(5)
        '''findLink = driver.find_elements_by_class_name('nav nav_tabs');
        for links in findLink:
            print links.click();'''
        '''analytics_link = driver.find_element_by_link_text('Analytics')
        analytics_link.click()
        time.sleep(5)
        distr_link = driver.find_element_by_link_text('Distributions')
        distr_link.click()
        time.sleep(5)
        estim_link = driver.find_element_by_link_text('Estimation')
        estim_link.click()
        time.sleep(5)
        proj_link = driver.find_element_by_link_text('Projects')
        proj_link.click()'''
        time.sleep(5)
        assert "No results found." not in driver.page_source


    def tearDown(self):
        self.driver.close()

if __name__ == "__main__":
    unittest.main()


'''require('chromedriver');
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
driver.quit();'''
