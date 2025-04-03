# apps/inventory/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from apps.products.models import Product

class Inventory(models.Model):
    """Inventory model to track product stock."""
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name='inventory',
        verbose_name=_('product')
    )
    current_stock = models.PositiveIntegerField(_('current stock'), default=0)
    last_updated = models.DateTimeField(_('last updated'), auto_now=True)
    
    class Meta:
        verbose_name = _('inventory')
        verbose_name_plural = _('inventories')
    
    def __str__(self):
        return f"{self.product.name} - {self.current_stock} units"

class InventoryTransaction(models.Model):
    """Model to track inventory changes."""
    TRANSACTION_IN = 'in'
    TRANSACTION_OUT = 'out'
    TRANSACTION_ADJUSTMENT = 'adjustment'
    
    TRANSACTION_TYPES = [
        (TRANSACTION_IN, _('Stock In')),
        (TRANSACTION_OUT, _('Stock Out')),
        (TRANSACTION_ADJUSTMENT, _('Adjustment')),
    ]
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name=_('product')
    )
    transaction_type = models.CharField(
        _('transaction type'),
        max_length=20,
        choices=TRANSACTION_TYPES
    )
    quantity = models.IntegerField(_('quantity'))
    previous_stock = models.PositiveIntegerField(_('previous stock'))
    new_stock = models.PositiveIntegerField(_('new stock'))
    reference = models.CharField(_('reference'), max_length=100, blank=True)
    reason = models.TextField(_('reason'), blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='inventory_transactions',
        verbose_name=_('created by')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('inventory transaction')
        verbose_name_plural = _('inventory transactions')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.transaction_type} - {self.product.name} ({self.quantity})"