from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='test@test.com', password='Test@1234')

    # TC-01: Valid Login
    def test_valid_login(self):
        response = self.client.post(reverse('login'), {
            'email': 'test@test.com',
            'password': 'Test@1234'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    # TC-02: Invalid Login
    def test_invalid_login(self):
        response = self.client.post(reverse('login'), {
            'email': 'test@test.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # TC-03: Login with missing fields
    def test_login_missing_fields(self):
        response = self.client.post(reverse('login'), {'email': 'test@test.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
