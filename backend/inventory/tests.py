from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Item, Category, Unit, PurchaseRequest

User = get_user_model()


class InventoryTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='admin@test.com', password='Admin@1234')
        self.client.force_authenticate(user=self.user)

        self.category = Category.objects.create(name='Electronics')
        self.unit = Unit.objects.create(name='Pieces', symbol='pcs')
        self.item = Item.objects.create(
            sku='SKU001',
            name='Laptop',
            category=self.category,
            unit=self.unit,
            current_stock=50,
            reorder_level=10,
            price=1200.00
        )

    # TC-04: Add new item
    def test_add_item(self):
        response = self.client.post(reverse('item-list'), {
            'sku': 'SKU002',
            'name': 'Monitor',
            'current_stock': 20,
            'reorder_level': 5,
            'price': 300.00
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # TC-05: Update item
    def test_update_item(self):
        response = self.client.patch(reverse('item-detail', args=[self.item.id]), {
            'name': 'Gaming Laptop'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Gaming Laptop')

    # TC-06: Delete item
    def test_delete_item(self):
        response = self.client.delete(reverse('item-detail', args=[self.item.id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    # TC-07: Stock inward
    def test_stock_inward(self):
        response = self.client.post(reverse('stock-inward'), {
            'item': self.item.id,
            'quantity': 10
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.item.refresh_from_db()
        self.assertEqual(self.item.current_stock, 60)

    # TC-08: Stock outward with sufficient stock
    def test_stock_outward_sufficient(self):
        response = self.client.post(reverse('stock-outward'), {
            'item': self.item.id,
            'quantity': 20
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.item.refresh_from_db()
        self.assertEqual(self.item.current_stock, 30)

    # TC-09: Stock outward with insufficient stock
    def test_stock_outward_insufficient(self):
        response = self.client.post(reverse('stock-outward'), {
            'item': self.item.id,
            'quantity': 999
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    # TC-10: Submit purchase request
    def test_submit_purchase_request(self):
        response = self.client.post(reverse('purchase-request-list'), {
            'item': self.item.id,
            'quantity': 5,
            'justification': 'Stock running low'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'Submitted')

    # TC-11: Approve purchase request
    def test_approve_purchase_request(self):
        pr = PurchaseRequest.objects.create(
            item=self.item, requested_by=self.user, quantity=5, status='Submitted'
        )
        response = self.client.put(reverse('approval-update'), {
            'request_id': pr.id,
            'action': 'Approved'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'Approved')

    # TC-12: Reject purchase request
    def test_reject_purchase_request(self):
        pr = PurchaseRequest.objects.create(
            item=self.item, requested_by=self.user, quantity=5, status='Submitted'
        )
        response = self.client.put(reverse('approval-update'), {
            'request_id': pr.id,
            'action': 'Rejected',
            'comments': 'Budget exceeded'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'Rejected')
