from rest_framework import serializers

from .models import (
    Category, Item, StockTransaction, PurchaseRequest, Approval,
    Supplier, Quotation, PurchaseOrder, PurchaseOrderItem, Unit, Payment
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'


class ItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    unit = UnitSerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    unit_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Item
        fields = [
            'id', 'sku', 'name', 'description', 'category', 'category_id',
            'unit', 'unit_id', 'reorder_level', 'current_stock', 'price',
            'is_active', 'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        unit_id = validated_data.pop('unit_id', None)
        if category_id is not None:
            validated_data['category_id'] = category_id
        if unit_id is not None:
            validated_data['unit_id'] = unit_id
        return Item.objects.create(**validated_data)

    def update(self, instance, validated_data):
        category_id = validated_data.pop('category_id', None)
        unit_id = validated_data.pop('unit_id', None)
        if category_id is not None:
            instance.category_id = category_id
        if unit_id is not None:
            instance.unit_id = unit_id
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class StockTransactionSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()

    class Meta:
        model = StockTransaction
        fields = [
            'id', 'item', 'item_name', 'transaction_type', 'quantity',
            'reference', 'notes', 'created_by', 'created_at',
        ]
        read_only_fields = ['item_name', 'created_by', 'created_at']

    def get_item_name(self, obj):
        return obj.item.name


class PurchaseRequestSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    requested_by_email = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseRequest
        fields = [
            'id', 'item', 'item_name', 'requested_by', 'requested_by_email',
            'quantity', 'justification', 'priority', 'status', 'created_at', 'updated_at',
        ]
        read_only_fields = ['item_name', 'requested_by', 'requested_by_email', 'created_at', 'updated_at']

    def get_item_name(self, obj):
        return obj.item.name

    def get_requested_by_email(self, obj):
        return obj.requested_by.email if obj.requested_by else ''


class ApprovalSerializer(serializers.ModelSerializer):
    request_item = serializers.SerializerMethodField()
    approved_by_email = serializers.SerializerMethodField()

    class Meta:
        model = Approval
        fields = '__all__'

    def get_request_item(self, obj):
        return obj.purchase_request.item.name if obj.purchase_request_id else ''

    def get_approved_by_email(self, obj):
        return obj.approved_by.email if obj.approved_by else ''


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class QuotationSerializer(serializers.ModelSerializer):
    supplier_name = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()

    class Meta:
        model = Quotation
        fields = '__all__'

    def get_supplier_name(self, obj):
        return obj.supplier.name

    def get_item_name(self, obj):
        return obj.item.name


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'item', 'item_name', 'quantity', 'unit_price']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, required=False)
    supplier_name = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'supplier', 'supplier_name', 'order_number',
            'total_amount', 'status', 'created_at', 'items',
        ]
        read_only_fields = ['total_amount', 'created_at']

    def get_supplier_name(self, obj):
        return obj.supplier.name

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        total = 0
        for line in items_data:
            PurchaseOrderItem.objects.create(purchase_order=purchase_order, **line)
            total += line['quantity'] * line['unit_price']
        purchase_order.total_amount = total
        purchase_order.save(update_fields=['total_amount'])
        return purchase_order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            total = 0
            for line in items_data:
                PurchaseOrderItem.objects.create(purchase_order=instance, **line)
                total += line['quantity'] * line['unit_price']
            instance.total_amount = total
            instance.save(update_fields=['total_amount'])
        return instance


class PaymentSerializer(serializers.ModelSerializer):
    po_number = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = '__all__'

    def get_po_number(self, obj):
        return obj.purchase_order.order_number
