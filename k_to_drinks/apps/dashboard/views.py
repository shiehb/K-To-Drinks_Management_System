# apps/dashboard/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import DashboardSummarySerializer
from django.db.models import Sum, Count, Case, When, IntegerField, F
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order
from apps.deliveries.models import Delivery
from apps.products.models import Product
from apps.inventory.models import Inventory

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get dashboard summary data."""
        serializer = DashboardSummarySerializer({})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sales(self, request):
        """Get sales data for charts."""
        # Get date range from query params
        period = request.query_params.get('period', 'month')
        
        # Get current date
        now = timezone.now()
        
        # Calculate date range based on period
        if period == 'week':
            # Last 7 days
            start_date = now - timedelta(days=7)
            date_format = '%Y-%m-%d'
            group_by = 'day'
        elif period == 'month':
            # Last 30 days
            start_date = now - timedelta(days=30)
            date_format = '%Y-%m-%d'
            group_by = 'day'
        elif period == 'year':
            # Last 12 months
            start_date = now - timedelta(days=365)
            date_format = '%Y-%m'
            group_by = 'month'
        else:
            return Response(
                {'detail': 'Invalid period. Use week, month, or year.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Query sales data
        if group_by == 'day':
            sales_data = Order.objects.filter(
                created_at__gte=start_date
            ).extra(
                select={'date': f"strftime('{date_format}', created_at)"}
            ).values('date').annotate(
                total=Sum(F('items__quantity') * F('items__unit_price'))
            ).order_by('date')
        else:
            sales_data = Order.objects.filter(
                created_at__gte=start_date
            ).extra(
                select={'date': f"strftime('{date_format}', created_at)"}
            ).values('date').annotate(
                total=Sum(F('items__quantity') * F('items__unit_price'))
            ).order_by('date')
        
        # Format response
        result = {
            'period': period,
            'data': list(sales_data)
        }
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def inventory(self, request):
        """Get inventory data for charts."""
        # Get low stock items
        low_stock_items = Inventory.objects.filter(
            current_stock__lte=F('product__reorder_level')
        ).select_related('product').order_by('current_stock')[:10]
        
        # Format response
        result = {
            'low_stock_items': [
                {
                    'id': item.product.id,
                    'name': item.product.name,
                    'size': item.product.size,
                    'current_stock': item.current_stock,
                    'reorder_level': item.product.reorder_level
                }
                for item in low_stock_items
            ]
        }
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def deliveries(self, request):
        """Get delivery data for charts."""
        # Get date range from query params
        period = request.query_params.get('period', 'month')
        
        # Get current date
        now = timezone.now()
        
        # Calculate date range based on period
        if period == 'week':
            # Last 7 days
            start_date = now - timedelta(days=7)
            date_format = '%Y-%m-%d'
            group_by = 'day'
        elif period == 'month':
            # Last 30 days
            start_date = now - timedelta(days=30)
            date_format = '%Y-%m-%d'
            group_by = 'day'
        elif period == 'year':
            # Last 12 months
            start_date = now - timedelta(days=365)
            date_format = '%Y-%m'
            group_by = 'month'
        else:
            return Response(
                {'detail': 'Invalid period. Use week, month, or year.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Query delivery data
        if group_by == 'day':
            delivery_data = Delivery.objects.filter(
                delivery_date__gte=start_date
            ).extra(
                select={'date': f"strftime('{date_format}', delivery_date)"}
            ).values('date').annotate(
                total=Count('id'),
                delivered=Count(Case(When(status='delivered', then=1), output_field=IntegerField())),
                cancelled=Count(Case(When(status='cancelled', then=1), output_field=IntegerField()))
            ).order_by('date')
        else:
            delivery_data = Delivery.objects.filter(
                delivery_date__gte=start_date
            ).extra(
                select={'date': f"strftime('{date_format}', delivery_date)"}
            ).values('date').annotate(
                total=Count('id'),
                delivered=Count(Case(When(status='delivered', then=1), output_field=IntegerField())),
                cancelled=Count(Case(When(status='cancelled', then=1), output_field=IntegerField()))
            ).order_by('date')
        
        # Format response
        result = {
            'period': period,
            'data': list(delivery_data)
        }
        
        return Response(result)