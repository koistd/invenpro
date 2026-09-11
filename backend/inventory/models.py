from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Unit(models.Model):
    name = models.CharField(max_length=50, unique=True)
    symbol = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name


class Item(models.Model):
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True)
    reorder_level = models.PositiveIntegerField(default=0)
    current_stock = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    performance_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Quotation(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='quotations')
    item = models.ForeignKey('Item', on_delete=models.CASCADE, related_name='quotations')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    lead_time_days = models.PositiveIntegerField(default=0)
    valid_until = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.supplier.name} - {self.item.name}'


class StockTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('INWARD', 'Inward'),
        ('OUTWARD', 'Outward'),
    ]
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.PositiveIntegerField()
    reference = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.transaction_type == 'OUTWARD' and self.quantity > self.item.current_stock:
            raise ValidationError('Outward quantity cannot exceed current stock.')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.clean()
        super().save(*args, **kwargs)
        if not is_new:
            return
        if self.transaction_type == 'INWARD':
            self.item.current_stock += self.quantity
        elif self.transaction_type == 'OUTWARD':
            self.item.current_stock -= self.quantity
        self.item.save(update_fields=['current_stock'])

    def __str__(self):
        return f'{self.transaction_type} - {self.item.name}'


class PurchaseRequest(models.Model):
    REQUEST_STATUS = [
        ('Draft', 'Draft'),
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Ordered', 'Ordered'),
        ('Completed', 'Completed'),
    ]
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='purchase_requests')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField()
    justification = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default='Submitted')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.item.name} - {self.status}'


class Approval(models.Model):
    purchase_request = models.ForeignKey(PurchaseRequest, on_delete=models.CASCADE, related_name='approvals')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=[('Approved', 'Approved'), ('Rejected', 'Rejected')])
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.purchase_request.item.name} - {self.action}'


class PurchaseOrder(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    order_number = models.CharField(max_length=100, unique=True)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=50, default='Draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.order_number


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f'{self.purchase_order.order_number} - {self.item.name}'


class Payment(models.Model):
    PAYMENT_STATUS = [
        ('Unpaid', 'Unpaid'),
        ('Paid', 'Paid'),
        ('Overdue', 'Overdue'),
    ]
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='payments')
    bill_number = models.CharField(max_length=100)
    bill_date = models.DateField()
    total_amount = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='Unpaid')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.bill_number} - {self.status}'
