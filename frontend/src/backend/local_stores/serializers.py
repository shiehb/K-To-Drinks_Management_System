from rest_framework import serializers
from .models import (
    Store, Employee, Supplier, ProductCategory, Product, 
    Inventory, InventoryTransaction, Order, OrderItem, 
    Receipt, Delivery, DeliveryRoute, RouteStop, ProductExpiry
)
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id']

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            'id', 'name', 'location', 'lat', 'lng', 
            'owner_name', 'email', 'number', 'day',
            'opening_time', 'closing_time', 'monthly_sales_target',
            'average_order_value', 'customer_count',
            'is_archived', 'archived_at', 'created_at', 'updated_at',
            'traffic_level'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'archived_at']

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'employee_id', 'phone_number', 'address',
            'position', 'hire_date', 'is_delivery_personnel', 'is_active'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        employee = Employee.objects.create(user=user, **validated_data)
        return employee

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'email', 'phone_number',
            'address', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    
    class Meta:
        model = Product
        fields = [
            'id', 'product_id', 'name', 'description', 'category', 'category_name',
            'supplier', 'supplier_name', 'unit_price', 'cost_price',
            'reorder_level', 'current_stock', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_id = serializers.ReadOnlyField(source='product.product_id')
    
    class Meta:
        model = Inventory
        fields = [
            'id', 'product', 'product_name', 'product_id',
            'quantity', 'last_restock_date', 'next_restock_date'
        ]
        read_only_fields = ['id']

class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    performed_by_name = serializers.ReadOnlyField(source='performed_by.get_full_name')
    
    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'product', 'product_name', 'transaction_type',
            'quantity', 'transaction_date', 'reference', 'notes',
            'performed_by', 'performed_by_name'
        ]
        read_only_fields = ['id', 'transaction_date']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'quantity',
            'unit_price', 'subtotal'
        ]
        read_only_fields = ['id']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    store_name = serializers.ReadOnlyField(source='store.name')
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'store', 'store_name', 'order_date',
            'status', 'total_amount', 'notes', 'created_by',
            'created_by_name', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'order_date', 'updated_at']

class ReceiptSerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.order_id')
    store_name = serializers.ReadOnlyField(source='order.store.name')
    
    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_id', 'order', 'order_id', 'store_name',
            'payment_date', 'payment_method', 'amount_paid',
            'payment_reference', 'is_paid', 'receipt_file'
        ]
        read_only_fields = ['id', 'payment_date']

class DeliverySerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.order_id')
    store_name = serializers.ReadOnlyField(source='order.store.name')
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.user.get_full_name')
    
    class Meta:
        model = Delivery
        fields = [
            'id', 'delivery_id', 'order', 'order_id', 'store_name',
            'assigned_to', 'assigned_to_name', 'scheduled_date',
            'scheduled_time_window', 'actual_delivery_time', 'status',
            'customer_signature', 'confirmation_notes', 'route_sequence',
            'estimated_distance', 'estimated_duration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class RouteStopSerializer(serializers.ModelSerializer):
    delivery_id = serializers.ReadOnlyField(source='delivery.delivery_id')
    store_name = serializers.ReadOnlyField(source='delivery.order.store.name')
    
    class Meta:
        model = RouteStop
        fields = [
            'id', 'route', 'delivery', 'delivery_id', 'store_name',
            'sequence', 'estimated_arrival_time', 'actual_arrival_time', 'notes'
        ]
        read_only_fields = ['id']

class DeliveryRouteSerializer(serializers.ModelSerializer):
    stops = RouteStopSerializer(many=True, read_only=True)
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.user.get_full_name')
    
    class Meta:
        model = DeliveryRoute
        fields = [
            'id', 'route_id', 'date', 'assigned_to', 'assigned_to_name',
            'start_time', 'end_time', 'total_distance', 'total_duration',
            'notes', 'stops'
        ]
        read_only_fields = ['id']

class ProductExpirySerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = ProductExpiry
        fields = [
            'id', 'product', 'product_name', 'batch_number', 'quantity',
            'production_date', 'expiry_date', 'is_active'
        ]
        read_only_fields = ['id']

