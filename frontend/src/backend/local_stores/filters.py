import django_filters
from .models import (
    Store, Product, Order, Delivery, DeliveryRoute
)

class StoreFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    location = django_filters.CharFilter(lookup_expr='icontains')
    day = django_filters.ChoiceFilter(choices=[
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ])
    
    class Meta:
        model = Store
        fields = ['name', 'location', 'day', 'is_archived', 'traffic_level']

class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    description = django_filters.CharFilter(lookup_expr='icontains')
    min_price = django_filters.NumberFilter(field_name='unit_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='unit_price', lookup_expr='lte')
    low_stock = django_filters.BooleanFilter(method='filter_low_stock')
    
    def filter_low_stock(self, queryset, name, value):
        if value:
            return queryset.filter(current_stock__lte=models.F('reorder_level'))
        return queryset
    
    class Meta:
        model = Product
        fields = ['name', 'description', 'category', 'supplier', 'is_active']

class OrderFilter(django_filters.FilterSet):
    min_date = django_filters.DateFilter(field_name='order_date', lookup_expr='gte')
    max_date = django_filters.DateFilter(field_name='order_date', lookup_expr='lte')
    min_amount = django_filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    class Meta:
        model = Order
        fields = ['store', 'status', 'created_by', 'min_date', 'max_date', 'min_amount', 'max_amount']

class DeliveryFilter(django_filters.FilterSet):
    min_date = django_filters.DateFilter(field_name='scheduled_date', lookup_expr='gte')
    max_date = django_filters.DateFilter(field_name='scheduled_date', lookup_expr='lte')
    
    class Meta:
        model = Delivery
        fields = ['order', 'assigned_to', 'status', 'min_date', 'max_date']

class DeliveryRouteFilter(django_filters.FilterSet):
    min_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    max_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    
    class Meta:
        model = DeliveryRoute
        fields = ['assigned_to', 'min_date', 'max_date']

