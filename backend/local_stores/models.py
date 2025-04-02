from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Store(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    lat = models.FloatField()
    lng = models.FloatField()
    owner_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    number = models.CharField(max_length=20)
    day = models.CharField(
        max_length=10,
        choices=[
            ('Monday', 'Monday'),
            ('Tuesday', 'Tuesday'),
            ('Wednesday', 'Wednesday'),
            ('Thursday', 'Thursday'),
            ('Friday', 'Friday'),
            ('Saturday', 'Saturday'),
            ('Sunday', 'Sunday'),
        ]
    )
    # Operating hours
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    
    # Store performance metrics
    monthly_sales_target = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    customer_count = models.IntegerField(default=0)
    
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Add fields to support traffic information
    traffic_level = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ],
        default='low'
    )
    
    def __str__(self):
        return self.name


class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    phone_number = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    position = models.CharField(max_length=100)
    hire_date = models.DateField()
    is_delivery_personnel = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.employee_id})"


class Supplier(models.Model):
    name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class ProductCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Product Categories"


class Product(models.Model):
    product_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, related_name='products')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, related_name='products')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    reorder_level = models.IntegerField(default=10)
    current_stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.product_id})"


class Inventory(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory')
    quantity = models.IntegerField(default=0)
    last_restock_date = models.DateField(null=True, blank=True)
    next_restock_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"Inventory for {self.product.name}"
    
    class Meta:
        verbose_name_plural = "Inventories"


class InventoryTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
        ('adjustment', 'Adjustment'),
    )
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()
    transaction_date = models.DateTimeField(auto_now_add=True)
    reference = models.CharField(max_length=100, blank=True, null=True)  # Order ID, Delivery ID, etc.
    notes = models.TextField(blank=True, null=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.product.name} - {self.quantity}"


class Order(models.Model):
    ORDER_STATUS = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    order_id = models.CharField(max_length=20, unique=True)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='orders')
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_orders')
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.order_id} - {self.store.name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity} for Order {self.order.order_id}"


class Receipt(models.Model):
    PAYMENT_METHODS = (
        ('cash', 'Cash'),
        ('credit_card', 'Credit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_payment', 'Mobile Payment'),
    )
    
    receipt_id = models.CharField(max_length=20, unique=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='receipt')
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    is_paid = models.BooleanField(default=False)
    
    # For digital receipt copies
    receipt_file = models.FileField(upload_to='receipts/', blank=True, null=True)
    
    def __str__(self):
        return f"Receipt {self.receipt_id} for Order {self.order.order_id}"


class Delivery(models.Model):
    DELIVERY_STATUS = (
        ('pending', 'Pending'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    )
    
    delivery_id = models.CharField(max_length=20, unique=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='deliveries')
    scheduled_date = models.DateField()
    scheduled_time_window = models.CharField(max_length=50)  # e.g., "9:00 AM - 12:00 PM"
    actual_delivery_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS, default='pending')
    
    # Customer confirmation
    customer_signature = models.ImageField(upload_to='signatures/', blank=True, null=True)
    confirmation_notes = models.TextField(blank=True, null=True)
    
    # Route optimization
    route_sequence = models.IntegerField(null=True, blank=True)  # Position in the delivery route
    estimated_distance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # in km
    estimated_duration = models.IntegerField(null=True, blank=True)  # in minutes
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Delivery {self.delivery_id} for Order {self.order.order_id}"
    
    class Meta:
        verbose_name_plural = "Deliveries"


class DeliveryRoute(models.Model):
    route_id = models.CharField(max_length=20, unique=True)
    date = models.DateField()
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='routes')
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    total_distance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # in km
    total_duration = models.IntegerField(null=True, blank=True)  # in minutes
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Route {self.route_id} on {self.date}"


class RouteStop(models.Model):
    route = models.ForeignKey(DeliveryRoute, on_delete=models.CASCADE, related_name='stops')
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='route_stops')
    sequence = models.IntegerField()  # Order in the route
    estimated_arrival_time = models.TimeField(null=True, blank=True)
    actual_arrival_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Stop {self.sequence} on Route {self.route.route_id}"
    
    class Meta:
        ordering = ['sequence']


class ProductExpiry(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='expiry_records')
    batch_number = models.CharField(max_length=50)
    quantity = models.IntegerField()
    production_date = models.DateField()
    expiry_date = models.DateField()
    is_active = models.BooleanField(default=True)  # False if expired or removed from inventory
    
    def __str__(self):
        return f"{self.product.name} - Batch {self.batch_number} - Expires {self.expiry_date}"
    
    class Meta:
        verbose_name_plural = "Product Expiries"

