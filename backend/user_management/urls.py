from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from local_stores import views as store_views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Create a router if you're using DRF viewsets
router = routers.DefaultRouter()
router.register(r'stores', store_views.StoreViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),      # User authentication routes
    
    # Store management routes - choose one approach below
    
    # Option 1: Using include with local_stores.urls
    path('api/', include('local_stores.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    
]