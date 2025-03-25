from django.db import models

class Store(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday')
    ]
    
    name = models.CharField(max_length=200)
    location = models.TextField()
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    owner_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    number = models.CharField(max_length=20)

    def __str__(self):
        return self.name