# k_to_drinks/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.inventory.urls')),
    path('api/', include('apps.stores.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/', include('apps.deliveries.urls')),
    path('api/', include('apps.dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)