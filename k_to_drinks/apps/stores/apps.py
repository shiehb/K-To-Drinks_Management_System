# apps/stores/apps.py
from django.apps import AppConfig

class StoresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.stores'
    verbose_name = 'Stores'