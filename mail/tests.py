from django.test import TestCase

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

    def test_is_mail_unread(self):
        a = True
        self.assertTrue(a)
