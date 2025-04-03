# apps/orders/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.stores.models import Store
from apps.products.models import Product

class Order(models.Model):
    """Order model."""
    STATUS_PENDING = 'pending'
    STATUS_PROCESSING = 'processing'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (STATUS_PENDING, _('Pending')),
        (STATUS_PROCESSING, _('Processing')),
        (STATUS_COMPLETED, _('Completed')),
        (STATUS_CANCELLED, _('Cancelled')),
    ]
    
    order_id = models.CharField(_('order ID'), max_length=50, unique=True)
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name=_('store')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )
    notes = models.TextField(_('notes'), blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_orders',
        verbose_name=_('created by')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('order')
        verbose_name_plural = _('orders')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.order_id
    
    @property
    def total_amount(self):
        """Calculate the total amount of the order."""
        return sum(item.total_price for item in self.items.all())

class OrderItem(models.Model):
    """Order item model."""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('order')
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='order_items',
        verbose_name=_('product')
    )
    quantity = models.PositiveIntegerField(_('quantity'))
    unit_price = models.DecimalField(_('unit price'), max_digits=10, decimal_places=2)
    
    class Meta:
        verbose_name = _('order item')
        verbose_name_plural = _('order items')
    
    def __str__(self):
        return f"{self.product.name} ({self.quantity})"
    
    @property
    def total_price(self):
        """Calculate the total price of the order item."""
        return self.quantity * self.unit_price