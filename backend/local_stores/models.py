from django.db import models
from django.utils import timezone

class Store(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    lat = models.FloatField()
    lng = models.FloatField()
    owner_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    number = models.CharField(max_length=20)
    day = models.CharField(
        max_length=10,
        choices=[
            ('Monday', 'Monday'),
            ('Tuesday', 'Tuesday'),
            ('Wednesday', 'Wednesday'),
            ('Thursday', 'Thursday'),
            ('Friday', 'Friday'),
            ('Saturday', 'Saturday'),
            ('Sunday', 'Sunday'),
        ]
    )
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Add fields to support traffic information
    traffic_level = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ],
        default='low'
    )
    
    def __str__(self):
        return self.name

