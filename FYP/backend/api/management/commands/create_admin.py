from django.core.management.base import BaseCommand
from api.models import User


class Command(BaseCommand):
    help = 'Creates an admin user if one does not exist'

    def handle(self, *args, **options):
        if not User.objects.filter(role='ADMIN').exists():
            admin = User.objects.create_superuser(
                email='admin@aiu.edu.my',
                name='System Admin',
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS(f'Admin user created successfully!'))
            self.stdout.write(self.style.SUCCESS(f'Email: admin@aiu.edu.my'))
            self.stdout.write(self.style.SUCCESS(f'Password: admin123'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))
