from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

from inventory.models import (
    Approval,
    Category,
    Item,
    Payment,
    PurchaseOrder,
    PurchaseOrderItem,
    PurchaseRequest,
    Quotation,
    Supplier,
    Unit,
)


class Command(BaseCommand):
    help = 'Create a repeatable demo dataset for the inventory dashboard.'

    def handle(self, *args, **options):
        user = get_user_model().objects.order_by('id').first()
        if not user:
            raise CommandError('Create at least one user before seeding demo data.')

        category_specs = [
            ('Office Supplies', 'Everyday office and printing supplies.'),
            ('IT Equipment', 'Computers, accessories, and network equipment.'),
            ('Warehouse Supplies', 'Materials used for storage and dispatch.'),
        ]
        categories = {
            name: Category.objects.update_or_create(name=name, defaults={'description': description})[0]
            for name, description in category_specs
        }

        unit_specs = [('Piece', 'pc'), ('Box', 'box'), ('Pack', 'pack')]
        units = {
            name: Unit.objects.update_or_create(name=name, defaults={'symbol': symbol})[0]
            for name, symbol in unit_specs
        }

        item_specs = [
            ('DEMO-HP45', 'HP 45 Printer Cartridge', 'Office Supplies', 'Piece', 10, 3, '24.50'),
            ('DEMO-A4-500', 'A4 Copy Paper 500 Sheets', 'Office Supplies', 'Pack', 45, 20, '6.75'),
            ('DEMO-MOUSE', 'Wireless Office Mouse', 'IT Equipment', 'Piece', 4, 8, '18.00'),
            ('DEMO-LABEL', 'Shipping Labels', 'Warehouse Supplies', 'Box', 2, 5, '32.00'),
            ('DEMO-SCANNER', 'Barcode Scanner', 'IT Equipment', 'Piece', 12, 4, '89.00'),
        ]
        items = {}
        for sku, name, category, unit, stock, reorder, price in item_specs:
            item, _ = Item.objects.update_or_create(
                sku=sku,
                defaults={
                    'name': name,
                    'category': categories[category],
                    'unit': units[unit],
                    'current_stock': stock,
                    'reorder_level': reorder,
                    'price': Decimal(price),
                    'is_active': True,
                },
            )
            items[sku] = item

        supplier, _ = Supplier.objects.update_or_create(
            name='TechSupplies Ltd',
            defaults={
                'contact_person': 'Ayesha Khan',
                'email': 'sales@techsupplies.example',
                'phone': '+1 555 010 2040',
                'address': '100 Supply Street',
            },
        )
        Quotation.objects.update_or_create(
            supplier=supplier,
            item=items['DEMO-HP45'],
            defaults={'unit_price': Decimal('22.00'), 'lead_time_days': 3},
        )

        request_specs = [
            ('DEMO-HP45', 12, 'High', 'Submitted', 'Printer cartridges are below the reorder level.'),
            ('DEMO-MOUSE', 15, 'Medium', 'Under Review', 'New workstations need wireless mice.'),
            ('DEMO-LABEL', 10, 'Critical', 'Approved', 'Shipping labels are required for dispatch.'),
            ('DEMO-SCANNER', 6, 'Low', 'Completed', 'Additional scanners for receiving.'),
        ]
        requests = {}
        for sku, quantity, priority, status, justification in request_specs:
            request, _ = PurchaseRequest.objects.update_or_create(
                item=items[sku],
                requested_by=user,
                justification=justification,
                defaults={'quantity': quantity, 'priority': priority, 'status': status},
            )
            requests[sku] = request

        Approval.objects.update_or_create(
            purchase_request=requests['DEMO-LABEL'],
            defaults={'approved_by': user, 'action': 'Approved', 'comments': 'Approved for dispatch operations.'},
        )

        order, _ = PurchaseOrder.objects.update_or_create(
            order_number='PO-DEMO-0001',
            defaults={'supplier': supplier, 'status': 'Ordered', 'total_amount': Decimal('264.00')},
        )
        PurchaseOrderItem.objects.update_or_create(
            purchase_order=order,
            item=items['DEMO-HP45'],
            defaults={'quantity': 12, 'unit_price': Decimal('22.00')},
        )
        Payment.objects.update_or_create(
            purchase_order=order,
            bill_number='BILL-DEMO-0001',
            defaults={
                'bill_date': '2026-09-01',
                'total_amount': Decimal('264.00'),
                'status': 'Unpaid',
            },
        )

        self.stdout.write(self.style.SUCCESS('Demo data is ready.'))