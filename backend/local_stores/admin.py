from django.contrib import admin
from .models import Store

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'day', 'owner_name')
    list_filter = ('day',)
    search_fields = ('name', 'location', 'owner_name')