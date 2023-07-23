from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.binary_location = r"C:\\Program Files\\Mozilla Firefox\\firefox.exe"
driver = webdriver.Firefox(options=options, executable_path=r"C:\\Users\\Vishwesh\\hackathon\\InternHackathon\\WebScrap\\geckodriver.exe")


def fetch_data_between_elements(link):
    options.headless = True
    driver = webdriver.Firefox(options=options, executable_path=r"C:\\Users\\Vishwesh\\hackathon\\InternHackathon\\WebScrap\\geckodriver.exe")
    try:
        driver.get(link)
        time.sleep(3)
        anchor_tags = driver.find_elements(By.XPATH, "/html/body/main/div/div[4]/div[2]/div/div/div[1]/div/div[1]/div[1]/div[2]/div//div/a")
        for each in anchor_tags:
            href = each.get_attribute("href")
            driver = webdriver.Firefox(options=options, executable_path=r"C:\\Users\\Vishwesh\\hackathon\\InternHackathon\\WebScrap\\geckodriver.exe")
            driver.get(href)

            data = driver.find_elements(By.XPATH, "/html/body/main/aside/section[2]/p")
            f = open("data.csv", "a")

            name = '"' + data[0].text + '",' 
            address = '"' + data[1].text

            f.write(name)
            for i in range(2, len(data)-1):
                address = address + "," + data[i].text  
            address += '"'

            f.write(address)
            f.write("\n")
            f.close()

            try:
                logo = driver.find_element(By.XPATH, "/html/body/main/aside/section[1]/div/div/div/div/div/img")
                driver.execute_script("arguments[0].scrollIntoView();", logo)
                logo_image = logo.screenshot_as_png
                name_continuous = name.replace(" ", "").replace(",", "").replace('"', '')
                with open(f'logos/{name_continuous}.png', 'wb') as image:
                    image.write(logo_image)
            except Exception as e:
                print(f"Failed to grab logo of {name}")
                print(e)

            driver.quit()
    except Exception as e:
        print("Error:", e)

    finally:
        driver.quit()

def main():
    base_url = "https://www.esri.com/en-us/about/partners/find-partner/search?p=" 
    for i in range(91, 100):
        print(f"Page number: {i}")
        page_url = base_url + str(i)
        fetch_data_between_elements(page_url)

if __name__ == "__main__":
    main()