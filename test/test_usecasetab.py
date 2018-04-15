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


        #check usecase tab
        usecase_tab=driver.find_element_by_xpath('//*[@id="repo-stats-chart"]/div/ul/li[4]/a')
        usecase_tab.click()
        time.sleep(3)
        project_tab=driver.find_element_by_xpath('//*[@id="project_list"]/div/div[1]/div/div/a')
        project_tab.click()
        time.sleep(3)
        usecasefnstab=driver.find_element_by_xpath('//*[@id="model-stats-chart"]/div/ul/li[5]/a')
        usecasefnstab.click()
        time.sleep(3)
        #each use case functions
        func1=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[1]/a')
        func1.click()
        time.sleep(3)
        func2=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[2]/a')
        func2.click()
        time.sleep(3)
        func3=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[3]/a')
        func3.click()
        time.sleep(3)
        func4=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[4]/a')
        func4.click()
        time.sleep(3)
        func5=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[5]/a')
        func5.click()
        time.sleep(3)
        func6=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[6]/a')
        func6.click()
        time.sleep(3)
        func7=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[7]/a')
        func7.click()
        time.sleep(3)
        func8=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[8]/a')
        func8.click()
        time.sleep(3)
        func9=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[9]/a')
        func9.click()
        time.sleep(3)
        func10=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[10]/a')
        func10.click()
        time.sleep(3)
        '''func11=driver.find_element_by_xpath('//*[@id="model-use-cases-panel"]/div[2]/div[11]/a')
        func11.click()
        time.sleep(3)'''

        #time.sleep(5)
        assert "No results found." not in driver.page_source


    def tearDown(self):
        self.driver.close()

if __name__ == "__main__":
    unittest.main()
