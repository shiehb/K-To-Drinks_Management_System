# apps/orders/admin.py
from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'store', 'status', 'created_by', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_id', 'store__name')
    inlines = [OrderItemInline]