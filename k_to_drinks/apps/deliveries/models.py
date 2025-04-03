# apps/deliveries/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.orders.models import Order

class Delivery(models.Model):
    """Delivery model."""
    STATUS_PENDING = 'pending'
    STATUS_IN_TRANSIT = 'in-transit'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (STATUS_PENDING, _('Pending')),
        (STATUS_IN_TRANSIT, _('In Transit')),
        (STATUS_DELIVERED, _('Delivered')),
        (STATUS_CANCELLED, _('Cancelled')),
    ]
    
    delivery_id = models.CharField(_('delivery ID'), max_length=50, unique=True)
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='delivery',
        verbose_name=_('order')
    )
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='deliveries',
        verbose_name=_('employee')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )
    delivery_date = models.DateField(_('delivery date'))
    delivery_time = models.TimeField(_('delivery time'))
    notes = models.TextField(_('notes'), blank=True)
    signature = models.ImageField(_('signature'), upload_to='signatures/', blank=True, null=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('delivery')
        verbose_name_plural = _('deliveries')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.delivery_id