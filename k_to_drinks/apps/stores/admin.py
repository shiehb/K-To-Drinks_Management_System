# apps/stores/admin.py
from django.contrib import admin
from .models import Store

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'owner_name', 'day', 'is_archived')
    list_filter = ('day', 'is_archived')
    search_fields = ('name', 'location', 'owner_name')