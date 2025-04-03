# apps/stores/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _

class Store(models.Model):
    """Store model."""
    name = models.CharField(_('name'), max_length=200)
    location = models.TextField(_('location'))
    lat = models.FloatField(_('latitude'), null=True, blank=True)
    lng = models.FloatField(_('longitude'), null=True, blank=True)
    owner_name = models.CharField(_('owner name'), max_length=200)
    email = models.EmailField(_('email'), blank=True)
    number = models.CharField(_('contact number'), max_length=20)
    day = models.CharField(_('delivery day'), max_length=20)
    is_archived = models.BooleanField(_('is archived'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('store')
        verbose_name_plural = _('stores')
        ordering = ['name']
    
    def __str__(self):
        return self.name