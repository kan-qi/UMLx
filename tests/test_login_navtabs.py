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

        #Tests login button
        elem = driver.find_element_by_name("username")
        elem.send_keys("umlxteam")
        elem1 = driver.find_element_by_name("password")
        elem1.send_keys("umlxteamfighton")
        loginbutton = driver.find_element_by_css_selector('#login-form > input.btn.btn-primary.signUpButton')
        loginbutton.click()
        time.sleep(3)

        #tests the nav tabs
        distr_link=driver.find_element_by_xpath('//*[@id="repo-stats-chart"]/div/ul/li[1]/a')
        distr_link.click()
        time.sleep(3)
        distr_link=driver.find_element_by_xpath('//*[@id="repo-stats-chart"]/div/ul/li[2]/a')
        distr_link.click()
        time.sleep(3)
        distr_link=driver.find_element_by_xpath('//*[@id="repo-stats-chart"]/div/ul/li[3]/a')
        distr_link.click()
        time.sleep(3)
        distr_link=driver.find_element_by_xpath('//*[@id="repo-stats-chart"]/div/ul/li[4]/a')
        distr_link.click()
        time.sleep(3)

        #time.sleep(5)
        assert "No results found." not in driver.page_source


    def tearDown(self):
        self.driver.close()

if __name__ == "__main__":
    unittest.main()
