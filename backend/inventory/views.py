from django.db.models import F
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Item, StockTransaction, PurchaseRequest, Approval, Supplier, Quotation, PurchaseOrder, PurchaseOrderItem, Payment, Unit
from .serializers import (
    CategorySerializer, ItemSerializer, StockTransactionSerializer,
    PurchaseRequestSerializer, ApprovalSerializer, SupplierSerializer,
    QuotationSerializer, PurchaseOrderSerializer, PaymentSerializer, UnitSerializer
)


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class UnitListCreateView(generics.ListCreateAPIView):
    queryset = Unit.objects.all().order_by('name')
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]


class UnitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]


class ItemListCreateView(generics.ListCreateAPIView):
    queryset = Item.objects.select_related('category', 'unit').all().order_by('-created_at')
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response(ItemSerializer(item).data, status=status.HTTP_201_CREATED)


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Item deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class StockInwardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = StockTransaction.objects.filter(transaction_type='INWARD').order_by('-created_at')[:20]
        return Response(StockTransactionSerializer(transactions, many=True).data)

    def post(self, request):
        item_id = request.data.get('item')
        quantity = request.data.get('quantity')
        reference = request.data.get('reference', '')
        notes = request.data.get('notes', '')

        if not item_id or not quantity:
            return Response({'error': 'Item and quantity are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = Item.objects.get(pk=item_id)
        except Item.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        transaction = StockTransaction.objects.create(
            item=item, transaction_type='INWARD', quantity=int(quantity),
            reference=reference, notes=notes, created_by=request.user,
        )
        return Response(StockTransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)


class StockOutwardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = StockTransaction.objects.filter(transaction_type='OUTWARD').order_by('-created_at')[:20]
        return Response(StockTransactionSerializer(transactions, many=True).data)

    def post(self, request):
        item_id = request.data.get('item')
        quantity = request.data.get('quantity')
        reference = request.data.get('reference', '')
        notes = request.data.get('notes', '')

        if not item_id or not quantity:
            return Response({'error': 'Item and quantity are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = Item.objects.get(pk=item_id)
        except Item.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        if int(quantity) > item.current_stock:
            return Response({'error': 'Outward quantity cannot exceed current stock.'}, status=status.HTTP_400_BAD_REQUEST)

        transaction = StockTransaction.objects.create(
            item=item, transaction_type='OUTWARD', quantity=int(quantity),
            reference=reference, notes=notes, created_by=request.user,
        )
        return Response(StockTransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)


class PurchaseRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = PurchaseRequest.objects.select_related('item', 'requested_by').all().order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class PurchaseRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseRequest.objects.all()
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsAuthenticated]


class ApprovalUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        approvals = Approval.objects.select_related('purchase_request', 'approved_by').all().order_by('-created_at')
        return Response(ApprovalSerializer(approvals, many=True).data)

    def put(self, request):
        request_id = request.data.get('request_id')
        action = request.data.get('action')
        comments = request.data.get('comments', '')

        if not request_id or action not in ['Approved', 'Rejected']:
            return Response({'error': 'request_id and valid action are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            purchase_request = PurchaseRequest.objects.get(pk=request_id)
        except PurchaseRequest.DoesNotExist:
            return Response({'error': 'Purchase request not found.'}, status=status.HTTP_404_NOT_FOUND)

        purchase_request.status = action
        purchase_request.save(update_fields=['status', 'updated_at'])

        approval = Approval.objects.create(
            purchase_request=purchase_request, approved_by=request.user,
            action=action, comments=comments,
        )
        return Response(ApprovalSerializer(approval).data, status=status.HTTP_200_OK)


class SupplierListCreateView(generics.ListCreateAPIView):
    queryset = Supplier.objects.all().order_by('name')
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]


class QuotationListCreateView(generics.ListCreateAPIView):
    queryset = Quotation.objects.select_related('supplier', 'item').all().order_by('-created_at')
    serializer_class = QuotationSerializer
    permission_classes = [IsAuthenticated]


class QuotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer
    permission_classes = [IsAuthenticated]


class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    queryset = PurchaseOrder.objects.select_related('supplier').all().order_by('-created_at')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]


class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseOrder.objects.prefetch_related('items__item').all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]


class PurchaseOrderReceiveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            purchase_order = PurchaseOrder.objects.prefetch_related('items__item').get(pk=pk)
        except PurchaseOrder.DoesNotExist:
            return Response({'error': 'Purchase order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if purchase_order.status == 'Received':
            return Response({'error': 'This order has already been received.'}, status=status.HTTP_400_BAD_REQUEST)

        lines = list(purchase_order.items.all())
        if not lines:
            return Response({'error': 'Add line items before receiving this order.'}, status=status.HTTP_400_BAD_REQUEST)

        for line in lines:
            StockTransaction.objects.create(
                item=line.item,
                transaction_type='INWARD',
                quantity=line.quantity,
                reference=purchase_order.order_number,
                notes='Goods received against purchase order',
                created_by=request.user,
            )

        purchase_order.status = 'Received'
        purchase_order.save(update_fields=['status'])
        return Response(PurchaseOrderSerializer(purchase_order).data, status=status.HTTP_200_OK)


class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.select_related('purchase_order').all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        low_stock_qs = Item.objects.filter(current_stock__lte=F('reorder_level')).order_by('current_stock')[:8]
        recent_requests = PurchaseRequest.objects.select_related('item').order_by('-created_at')[:6]
        data = {
            'total_items': Item.objects.count(),
            'low_stock': Item.objects.filter(current_stock__lte=F('reorder_level')).count(),
            'pending_requests': PurchaseRequest.objects.filter(status__in=['Submitted', 'Under Review']).count(),
            'approved': PurchaseRequest.objects.filter(status='Approved').count(),
            'orders': PurchaseOrder.objects.count(),
            'payments': Payment.objects.filter(status='Unpaid').count(),
            'low_stock_items': [
                {
                    'id': item.id,
                    'sku': item.sku,
                    'name': item.name,
                    'current_stock': item.current_stock,
                    'reorder_level': item.reorder_level,
                }
                for item in low_stock_qs
            ],
            'recent_requests': PurchaseRequestSerializer(recent_requests, many=True).data,
        }
        return Response(data, status=status.HTTP_200_OK)
