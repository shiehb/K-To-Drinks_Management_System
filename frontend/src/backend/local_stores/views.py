from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F, Q
from django_filters.rest_framework import DjangoFilterBackend
import logging

from .models import (
    Store, Employee, Supplier, ProductCategory, Product, 
    Inventory, InventoryTransaction, Order, OrderItem, 
    Receipt, Delivery, DeliveryRoute, RouteStop, ProductExpiry
)
from .serializers import (
    StoreSerializer, EmployeeSerializer, SupplierSerializer, 
    ProductCategorySerializer, ProductSerializer, InventorySerializer,
    InventoryTransactionSerializer, OrderSerializer, OrderItemSerializer,
    ReceiptSerializer, DeliverySerializer, DeliveryRouteSerializer,
    RouteStopSerializer, ProductExpirySerializer
)

logger = logging.getLogger(__name__)

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['day', 'is_archived']
    search_fields = ['name', 'location', 'owner_name']
    ordering_fields = ['name', 'created_at', 'updated_at']

    def get_queryset(self):
        queryset = Store.objects.all()
        archived = self.request.query_params.get('archived', None)
        day = self.request.query_params.get('day', None)
        
        if archived is not None:
            archived = archived.lower() == 'true'
            queryset = queryset.filter(is_archived=archived)
            
        if day is not None:
            queryset = queryset.filter(day=day)
        
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            
            if 'email' in data and data['email'] == "":
                data['email'] = None
                
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except Exception as e:
            logger.error(f"Error creating store: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        store = self.get_object()
        archive_action = request.data.get('archive', True)
        
        store.is_archived = archive_action
        store.archived_at = timezone.now() if archive_action else None
        store.save()
        
        serializer = self.get_serializer(store)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def by_day(self, request):
        day = request.query_params.get('day', None)
        if not day:
            return Response(
                {"error": "Day parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        stores = Store.objects.filter(day=day, is_archived=False)
        serializer = self.get_serializer(stores, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def performance_metrics(self, request):
        stores = Store.objects.filter(is_archived=False)
        
        # Calculate performance metrics
        metrics = []
        for store in stores:
            orders_count = Order.objects.filter(store=store).count()
            total_sales = Order.objects.filter(store=store, status='completed').aggregate(
                total=Sum('total_amount')
            )['total'] or 0
            
            metrics.append({
                'id': store.id,
                'name': store.name,
                'orders_count': orders_count,
                'total_sales': total_sales,
                'average_order_value': store.average_order_value or 0,
                'monthly_sales_target': store.monthly_sales_target or 0,
                'target_achievement': (total_sales / store.monthly_sales_target * 100) if store.monthly_sales_target else 0
            })
            
        return Response(metrics)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_delivery_personnel', 'is_active', 'position']
    search_fields = ['user__first_name', 'user__last_name', 'employee_id']
    ordering_fields = ['user__last_name', 'hire_date']
    
    @action(detail=False, methods=['get'])
    def delivery_personnel(self, request):
        employees = Employee.objects.filter(is_delivery_personnel=True, is_active=True)
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'contact_person', 'email']
    ordering_fields = ['name', 'created_at']


class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'supplier', 'is_active']
    search_fields = ['name', 'product_id', 'description']
    ordering_fields = ['name', 'unit_price', 'current_stock', 'created_at']
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        products = Product.objects.filter(
            is_active=True,
            current_stock__lte=F('reorder_level')
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def transaction_history(self, request, pk=None):
        product = self.get_object()
        transactions = InventoryTransaction.objects.filter(product=product).order_by('-transaction_date')
        serializer = InventoryTransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product']
    search_fields = ['product__name', 'product__product_id']
    ordering_fields = ['quantity', 'last_restock_date', 'next_restock_date']
    
    @action(detail=False, methods=['get'])
    def needs_restock(self, request):
        inventories = Inventory.objects.filter(
            quantity__lte=F('product__reorder_level'),
            product__is_active=True
        )
        serializer = self.get_serializer(inventories, many=True)
        return Response(serializer.data)


class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'transaction_type']
    search_fields = ['product__name', 'reference', 'notes']
    ordering_fields = ['transaction_date']
    
    def perform_create(self, serializer):
        transaction = serializer.save()
        
        # Update product stock based on transaction type
        product = transaction.product
        if transaction.transaction_type == 'in':
            product.current_stock += transaction.quantity
        elif transaction.transaction_type == 'out':
            product.current_stock -= transaction.quantity
        elif transaction.transaction_type == 'adjustment':
            # For adjustments, the quantity can be positive or negative
            product.current_stock += transaction.quantity
            
        product.save()
        
        # Update inventory record
        inventory, created = Inventory.objects.get_or_create(product=product)
        inventory.quantity = product.current_stock
        if transaction.transaction_type == 'in':
            inventory.last_restock_date = timezone.now().date()
        inventory.save()


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store', 'status', 'created_by']
    search_fields = ['order_id', 'store__name', 'notes']
    ordering_fields = ['order_date', 'total_amount', 'status']
    
    def create(self, serializer):
        try:
            # Start a transaction to ensure data integrity
            with transaction.atomic():
                # Create the order
                order_data = request.data.copy()
                items_data = order_data.pop('items', [])
                
                # Generate a unique order ID
                order_data['order_id'] = f"ORD-{timezone.now().strftime('%Y%m%d')}-{Order.objects.count() + 1:04d}"
                
                serializer = self.get_serializer(data=order_data)
                serializer.is_valid(raise_exception=True)
                order = serializer.save(created_by=request.user)
                
                # Create order items
                total_amount = 0
                for item_data in items_data:
                    product = Product.objects.get(pk=item_data['product'])
                    quantity = item_data['quantity']
                    unit_price = product.unit_price
                    subtotal = unit_price * quantity
                    
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        unit_price=unit_price,
                        subtotal=subtotal
                    )
                    
                    # Update inventory
                    InventoryTransaction.objects.create(
                        product=product,
                        transaction_type='out',
                        quantity=-quantity,  # Negative for stock out
                        reference=order.order_id,
                        performed_by=request.user
                    )
                    
                    total_amount += subtotal
                
                # Update order total
                order.total_amount = total_amount
                order.save()
                
                return Response(
                    self.get_serializer(order).data,
                    status=status.HTTP_201_CREATED
                )
                
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status or new_status not in [s[0] for s in Order.ORDER_STATUS]:
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        order.status = new_status
        order.save()
        
        return Response(self.get_serializer(order).data)


class ReceiptViewSet(viewsets.ModelViewSet):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'payment_method', 'is_paid']
    search_fields = ['receipt_id', 'order__order_id', 'payment_reference']
    ordering_fields = ['payment_date', 'amount_paid']
    
    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            
            # Generate a unique receipt ID
            data['receipt_id'] = f"RCT-{timezone.now().strftime('%Y%m%d')}-{Receipt.objects.count() + 1:04d}"
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            receipt = serializer.save()
            
            # Update order status if payment is complete
            if receipt.is_paid:
                order = receipt.order
                if order.status == 'pending':
                    order.status = 'processing'
                    order.save()
            
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error creating receipt: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'assigned_to', 'scheduled_date', 'status']
    search_fields = ['delivery_id', 'order__order_id', 'order__store__name']
    ordering_fields = ['scheduled_date', 'status', 'created_at']
    
    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            
            # Generate a unique delivery ID
            data['delivery_id'] = f"DEL-{timezone.now().strftime('%Y%m%d')}-{Delivery.objects.count() + 1:04d}"
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            delivery = serializer.save()
            
            # Update order status
            order = delivery.order
            if order.status == 'processing':
                order.status = 'completed'
                order.save()
            
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error creating delivery: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        delivery = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status or new_status not in [s[0] for s in Delivery.DELIVERY_STATUS]:
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        delivery.status = new_status
        
        # If delivered, update the actual delivery time
        if new_status == 'delivered' and not delivery.actual_delivery_time:
            delivery.actual_delivery_time = timezone.now()
            
        delivery.save()
        
        return Response(self.get_serializer(delivery).data)
    
    @action(detail=False, methods=['get'])
    def by_day(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {"error": "Date parameter is required (YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        deliveries = Delivery.objects.filter(scheduled_date=date)
        serializer = self.get_serializer(deliveries, many=True)
        return Response(serializer.data)


class DeliveryRouteViewSet(viewsets.ModelViewSet):
    queryset = DeliveryRoute.objects.all()
    serializer_class = DeliveryRouteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['date', 'assigned_to']
    search_fields = ['route_id', 'assigned_to__user__first_name', 'assigned_to__user__last_name']
    ordering_fields = ['date', 'start_time']
    
    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            stops_data = data.pop('stops', [])
            
            # Generate a unique route ID
            data['route_id'] = f"RTE-{timezone.now().strftime('%Y%m%d')}-{DeliveryRoute.objects.count() + 1:04d}"
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            route = serializer.save()
            
            # Create route stops
            for stop_data in stops_data:
                stop_data['route'] = route.id
                stop_serializer = RouteStopSerializer(data=stop_data)
                stop_serializer.is_valid(raise_exception=True)
                stop_serializer.save()
                
                # Update delivery with route sequence
                delivery = Delivery.objects.get(pk=stop_data['delivery'])
                delivery.route_sequence = stop_data['sequence']
                delivery.save()
            
            return Response(
                self.get_serializer(route).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error creating route: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def by_employee(self, request):
        employee_id = request.query_params.get('employee_id')
        if not employee_id:
            return Response(
                {"error": "Employee ID parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        routes = DeliveryRoute.objects.filter(assigned_to__id=employee_id)
        serializer = self.get_serializer(routes, many=True)
        return Response(serializer.data)


class RouteStopViewSet(viewsets.ModelViewSet):
    queryset = RouteStop.objects.all()
    serializer_class = RouteStopSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['route', 'delivery']
    ordering_fields = ['sequence']


class ProductExpiryViewSet(viewsets.ModelViewSet):
    queryset = ProductExpiry.objects.all()
    serializer_class = ProductExpirySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'is_active']
    search_fields = ['product__name', 'batch_number']
    ordering_fields = ['expiry_date', 'production_date']
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        days = request.query_params.get('days', 30)
        try:
            days = int(days)
        except ValueError:
            days = 30
            
        expiry_date = timezone.now().date() + timezone.timedelta(days=days)
        expiring_products = ProductExpiry.objects.filter(
            expiry_date__lte=expiry_date,
            expiry_date__gte=timezone.now().date(),
            is_active=True
        )
        
        serializer = self.get_serializer(expiring_products, many=True)
        return Response(serializer.data)

