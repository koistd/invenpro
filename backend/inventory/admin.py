from django.contrib import admin
from .models import Category, Unit, Item, Supplier, Quotation, StockTransaction, PurchaseRequest, Approval, PurchaseOrder, PurchaseOrderItem, Payment

admin.site.register(Category)
admin.site.register(Unit)
admin.site.register(Item)
admin.site.register(Supplier)
admin.site.register(Quotation)
admin.site.register(StockTransaction)
admin.site.register(PurchaseRequest)
admin.site.register(Approval)
admin.site.register(PurchaseOrder)
admin.site.register(PurchaseOrderItem)
admin.site.register(Payment)
