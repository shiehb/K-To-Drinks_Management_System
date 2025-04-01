from rest_framework import serializers
from .models import Store

class StoreSerializer(serializers.ModelSerializer):
    """
    Serializer for the Store model.
    """
    class Meta:
        model = Store
        fields = [
            'id', 'name', 'location', 'lat', 'lng', 
            'owner_name', 'email', 'number', 'day',
            'is_archived', 'archived_at', 'created_at', 'updated_at',
            'traffic_level'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'archived_at']

