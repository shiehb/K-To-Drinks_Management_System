from django.contrib import admin
from .models import (
    Store, Employee, Supplier, ProductCategory, Product, 
    Inventory, InventoryTransaction, Order, OrderItem, 
    Receipt, Delivery, DeliveryRoute, RouteStop, ProductExpiry
)

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'owner_name', 'day', 'is_archived')
    list_filter = ('day', 'is_archived', 'traffic_level')
    search_fields = ('name', 'location', 'owner_name')
    readonly_fields = ('created_at', 'updated_at', 'archived_at')

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'employee_id', 'position', 'is_delivery_personnel', 'is_active')
    list_filter = ('is_delivery_personnel', 'is_active', 'position')
    search_fields = ('user__first_name', 'user__last_name', 'employee_id')
    
    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'Name'

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'email', 'phone_number', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'contact_person', 'email')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class InventoryInline(admin.StackedInline):
    model = Inventory
    can_delete = False
    extra = 0

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_id', 'category', 'supplier', 'unit_price', 'current_stock', 'is_active')
    list_filter = ('category', 'supplier', 'is_active')
    search_fields = ('name', 'product_id', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [InventoryInline]

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'quantity', 'last_restock_date', 'next_restock_date')
    list_filter = ('last_restock_date', 'next_restock_date')
    search_fields = ('product__name', 'product__product_id')

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ('product', 'transaction_type', 'quantity', 'transaction_date', 'reference')
    list_filter = ('transaction_type', 'transaction_date')
    search_fields = ('product__name', 'reference', 'notes')
    readonly_fields = ('transaction_date',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'store', 'order_date', 'status', 'total_amount')
    list_filter = ('status', 'order_date')
    search_fields = ('order_id', 'store__name', 'notes')
    readonly_fields = ('order_date', 'updated_at')
    inlines = [OrderItemInline]

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_id', 'order', 'payment_date', 'payment_method', 'amount_paid', 'is_paid')
    list_filter = ('payment_method', 'is_paid', 'payment_date')
    search_fields = ('receipt_id', 'order__order_id', 'payment_reference')
    readonly_fields = ('payment_date',)

@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('delivery_id', 'order', 'assigned_to', 'scheduled_date', 'status')
    list_filter = ('status', 'scheduled_date')
    search_fields = ('delivery_id', 'order__order_id', 'order__store__name')
    readonly_fields = ('created_at', 'updated_at')

class RouteStopInline(admin.TabularInline):
    model = RouteStop
    extra = 0

@admin.register(DeliveryRoute)
class DeliveryRouteAdmin(admin.ModelAdmin):
    list_display = ('route_id', 'date', 'assigned_to', 'start_time', 'end_time')
    list_filter = ('date',)
    search_fields = ('route_id', 'assigned_to__user__first_name', 'assigned_to__user__last_name')
    inlines = [RouteStopInline]

@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ('route', 'delivery', 'sequence', 'estimated_arrival_time', 'actual_arrival_time')
    list_filter = ('route__date',)
    search_fields = ('route__route_id', 'delivery__delivery_id')

@admin.register(ProductExpiry)
class ProductExpiryAdmin(admin.ModelAdmin):
    list_display = ('product', 'batch_number', 'quantity', 'production_date', 'expiry_date', 'is_active')
    list_filter = ('is_active', 'expiry_date', 'production_date')
    search_fields = ('product__name', 'batch_number')

