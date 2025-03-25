from django.db import models

class User(models.Model):
    ROLES = [
        ('manager', 'Manager'),
        ('delivery_driver', 'Delivery Driver'),
    ]
    STATUSES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]

    username = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=25, choices=ROLES, default='delivery_driver')
    status = models.CharField(max_length=25, choices=STATUSES, default='active')

    def __str__(self):
        return self.username