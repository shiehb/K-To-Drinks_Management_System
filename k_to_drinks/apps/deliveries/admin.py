# apps/deliveries/admin.py
from django.contrib import admin
from .models import Delivery

@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('delivery_id', 'order', 'employee', 'status', 'delivery_date', 'delivery_time')
    list_filter = ('status', 'delivery_date')
    search_fields = ('delivery_id', 'order__order_id')