# Generated migration for payment fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_passwordresetcode'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='payment_method',
            field=models.CharField(blank=True, choices=[('OFFLINE', 'Offline'), ('ONLINE', 'Online')], max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='payment_status',
            field=models.CharField(choices=[('PENDING', 'Pending'), ('PAID', 'Paid')], default='PENDING', max_length=10),
        ),
        migrations.AddField(
            model_name='booking',
            name='payment_receipt',
            field=models.ImageField(blank=True, null=True, upload_to='payment_receipts/'),
        ),
    ]
