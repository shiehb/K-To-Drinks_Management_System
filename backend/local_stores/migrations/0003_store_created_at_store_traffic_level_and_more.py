# Generated by Django 5.1.7 on 2025-04-01 10:11

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('local_stores', '0002_store_archived_at_store_is_archived_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='store',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='store',
            name='traffic_level',
            field=models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='low', max_length=10),
        ),
        migrations.AddField(
            model_name='store',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='store',
            name='lat',
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name='store',
            name='lng',
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name='store',
            name='location',
            field=models.CharField(max_length=255),
        ),
    ]
