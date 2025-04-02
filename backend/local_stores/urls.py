from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StoreViewSet, EmployeeViewSet, SupplierViewSet, ProductCategoryViewSet,
    ProductViewSet, InventoryViewSet, InventoryTransactionViewSet,
    OrderViewSet, ReceiptViewSet, DeliveryViewSet, DeliveryRouteViewSet,
    RouteStopViewSet, ProductExpiryViewSet
)

router = DefaultRouter()
router.register(r'stores', StoreViewSet, basename='store')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'product-categories', ProductCategoryViewSet, basename='product-category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'inventory-transactions', InventoryTransactionViewSet, basename='inventory-transaction')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'receipts', ReceiptViewSet, basename='receipt')
router.register(r'deliveries', DeliveryViewSet, basename='delivery')
router.register(r'delivery-routes', DeliveryRouteViewSet, basename='delivery-route')
router.register(r'route-stops', RouteStopViewSet, basename='route-stop')
router.register(r'product-expiry', ProductExpiryViewSet, basename='product-expiry')

urlpatterns = [
    path('', include(router.urls)),
]

