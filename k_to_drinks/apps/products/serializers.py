# apps/products/serializers.py
from rest_framework import serializers
from .models import Category, Product
from apps.inventory.models import Inventory

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    current_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'product_id', 'name', 'description', 'category', 'category_id',
            'unit_price', 'size', 'barcode', 'reorder_level', 'active',
            'current_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_stock(self, obj):
        try:
            return obj.inventory.current_stock
        except Inventory.DoesNotExist:
            return 0
    
    def create(self, validated_data):
        product = super().create(validated_data)
        # Create inventory record for the product
        Inventory.objects.create(product=product, current_stock=0)
        return product