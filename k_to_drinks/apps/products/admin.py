# apps/products/admin.py
from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_id', 'category', 'size', 'unit_price', 'active')
    list_filter = ('category', 'active')
    search_fields = ('name', 'product_id', 'barcode')