# apps/products/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _

class Category(models.Model):
    """Product category model."""
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True)
    
    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Product(models.Model):
    """Product model."""
    product_id = models.CharField(_('product ID'), max_length=50, unique=True)
    name = models.CharField(_('name'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('category')
    )
    unit_price = models.DecimalField(_('unit price'), max_digits=10, decimal_places=2)
    size = models.CharField(_('size'), max_length=50)
    barcode = models.CharField(_('barcode'), max_length=100, blank=True)
    reorder_level = models.PositiveIntegerField(_('reorder level'), default=10)
    active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('product')
        verbose_name_plural = _('products')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.size})"