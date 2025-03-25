"""
URL configuration for user_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from local_stores import views as store_views

# Create a router if you're using DRF viewsets
router = routers.DefaultRouter()
router.register(r'stores', store_views.StoreViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),      # User authentication routes
    
    # Store management routes - choose one approach below
    
    # Option 1: Using include with local_stores.urls
    path('api/', include('local_stores.urls')),
    
]