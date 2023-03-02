import os
import pathlib
import time

from django.test import TestCase, LiveServerTestCase
from django.contrib.contenttypes.models import ContentType

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver import FirefoxOptions

from .models import Email, User


# Create your tests here.


class MailTestCase(TestCase):

    def setUp(self):
        sender = User()
        sender.save()
        email = Email.objects.create(
            user=sender,
            sender=sender,
            subject="subject",
            body="body",
            read=False,
        )
        email.save()

    def test_one_mail_exists(self):
        mail_number = Email.objects.all().count()
        self.assertEquals(mail_number, 1)


class PlayerFormTest(LiveServerTestCase):
    driver = None
    port = 8888

    @classmethod
    def setUpClass(cls):
        ContentType.objects.clear_cache()
        super().setUpClass()
        # cls.driver = webdriver.Chrome()

    @classmethod
    def tearDownClass(cls):
        # cls.driver.quit()
        super().tearDownClass()

    def setUp(self):
        opts = FirefoxOptions()
        opts.add_argument("--headless")
        self.driver = webdriver.Firefox(options=opts)
        # self.driver = webdriver.Chrome()

    def test_page_test(self):
        driver = self.driver
        url = self.live_server_url + '/test'
        print(url)
        driver.get(url)
        time.sleep(2)

    def test_page_title(self):
        url = self.live_server_url + '/'
        self.driver.get(url)
        time.sleep(1)
        self.assertEquals(self.driver.title, 'Mail')

    def test_register_log_out_log_in_send_mail(self):
        url = self.live_server_url + '/register'
        self.driver.get(url)
        mail = self.driver.find_element(By.NAME, "email")
        mail.send_keys("daniel")
        password = self.driver.find_element(By.NAME, "password")
        password.send_keys("test")
        confirmation = self.driver.find_element(By.NAME, "confirmation")
        confirmation.send_keys("test")

        form = self.driver.find_element(By.ID, "register_form")
        form.submit()
        time.sleep(1)

        logout_btn = self.driver.find_element(By.ID, "logout")
        logout_btn.click()
        time.sleep(1)

        mail = self.driver.find_element(By.NAME, "email")
        mail.send_keys("daniel")
        password = self.driver.find_element(By.NAME, "password")
        password.send_keys("test")

        form = self.driver.find_element(By.ID, "login_form")
        form.submit()
        time.sleep(1)

        recipient = self.driver.find_element(By.ID, "compose-recipients")
        recipient.send_keys("test recipient")
        subject = self.driver.find_element(By.ID, "compose-subject")
        subject.send_keys("test Subject")
        body = self.driver.find_element(By.ID, "compose-body")
        body.send_keys("test body")
        form = self.driver.find_element(By.ID, "compose-form")
        time.sleep(2)
        form.submit()
        time.sleep(2)

    # def test_log_in(self):
    #     self.test_register()
    #     url = self.live_server_url + '/'
    #     self.driver.get(url)
    #     mail = self.driver.find_element(By.NAME, "email")
    #     mail.send_keys("daniel")
    #     password = self.driver.find_element(By.NAME, "password")
    #     password.send_keys("test")
    #
    #     form = self.driver.find_element(By.ID, "login_form")
    #     form.submit()
    #     time.sleep(10)

    # def test_inbox_page_selected(self):
    #     url = self.live_server_url + '/emails'
    #     print(url)
    #     self.driver.get(url)
    #     inbox_btn = self.driver.find_element(By.ID, "inbox")
    #     time.sleep(1)
    #
    #     print(self.driver.title)
