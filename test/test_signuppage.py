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

        #tests sign up button
        signupbutton=driver.find_element_by_xpath('//*[@id="login-form"]/p/a')
        signupbutton.click()
        email_signup = driver.find_element_by_xpath('//*[@id="email"]')
        email_signup.send_keys('abc1@gmail.com')
        username_signup = driver.find_element_by_xpath('//*[@id="username"]')
        username_signup.send_keys('ABC1')
        password_signup = driver.find_element_by_xpath('//*[@id="password"]')
        password_signup.send_keys('abcdefgA1.')
        enterprise_signup=driver.find_element_by_xpath('//*[@id="enterpriseUser"]')
        enterprise_signup.click()
        button_signup=driver.find_element_by_xpath('//*[@id="sign-up"]/input[5]')
        button_signup.click()
        time.sleep(5)


        #time.sleep(5)
        assert "No results found." not in driver.page_source


    def tearDown(self):
        self.driver.close()

if __name__ == "__main__":
    unittest.main()
