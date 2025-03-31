from rest_framework import serializers
from .models import Store

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True},
            'location': {'required': True},
            'lat': {'required': True, 'max_digits': 12, 'decimal_places': 6},
            'lng': {'required': True, 'max_digits': 12, 'decimal_places': 6},
            'owner_name': {'required': True},
            'email': {
                'required': False,
                'allow_null': True,
                'allow_blank': True},
            'number': {'required': True},
            'day': {'required': True},
            'is_archived': {'required': False, 'read_only': True},
            'archived_at': {'required': False, 'read_only': True}
        }

    def validate_email(self, value):
        return None if value == "" else value

    def validate(self, data):
        errors = {}
        
        # Coordinate validation
        lat = data.get('lat')
        lng = data.get('lng')
        
        if lat is not None:
            if not (-90 <= float(lat) <= 90):
                errors['lat'] = 'Must be between -90 and 90'
        
        if lng is not None:
            if not (-180 <= float(lng) <= 180):
                errors['lng'] = 'Must be between -180 and 180'
        
        if errors:
            raise serializers.ValidationError(errors)
            
        return data