# apps/inventory/admin.py
from django.contrib import admin
from .models import Inventory, InventoryTransaction

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'current_stock', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('product__name', 'product__product_id')

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ('product', 'transaction_type', 'quantity', 'previous_stock', 'new_stock', 'created_by', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('product__name', 'product__product_id', 'reference')