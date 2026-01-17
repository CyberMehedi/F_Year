from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import datetime, time


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('CLEANER', 'Cleaner'),
        ('STUDENT', 'Student'),
    )
    
    phone_validator = RegexValidator(
        regex=r'^\+?[1-9]\d{1,14}$',
        message='Phone number must be in E.164 format (e.g., +60123456789)'
    )
    
    email = models.EmailField(unique=True, max_length=255)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True, null=True, validators=[phone_validator], help_text='Phone number in E.164 format (e.g., +60123456789)')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.name} ({self.role})"
    
    def get_phone_number(self):
        """Get phone number from user or profile"""
        if self.phone_number:
            return self.phone_number
        
        # Fallback to profile phone numbers
        if hasattr(self, 'student_profile') and self.student_profile.phone:
            return self.student_profile.phone
        elif hasattr(self, 'cleaner_profile') and self.cleaner_profile.phone:
            return self.cleaner_profile.phone
        
        return None


class StudentProfile(models.Model):
    student_id_validator = RegexValidator(
        regex=r'^AIU\d{8}$',
        message='Student ID must be in format: AIU followed by 8 digits (e.g., AIU23102325)'
    )
    
    block_validator = RegexValidator(
        regex=r'^\d{2}[A-Z]$',
        message='Block must be in format: 2 digits followed by 1 uppercase letter (e.g., 25E)'
    )
    
    room_validator = RegexValidator(
        regex=r'^\d{2}[A-Z]-\d{2}-\d{2}$',
        message='Room number must be in format: 2 digits, 1 letter, dash, 2 digits, dash, 2 digits (e.g., 25E-04-10)'
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=20, unique=True, validators=[student_id_validator])
    block = models.CharField(max_length=10, validators=[block_validator])
    room_number = models.CharField(max_length=20, validators=[room_validator])
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    class Meta:
        db_table = 'student_profiles'
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
    
    def __str__(self):
        return f"{self.user.name} - {self.student_id}"


class CleanerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cleaner_profile')
    staff_id = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20)
    assigned_blocks = models.CharField(max_length=255, blank=True, help_text='Comma-separated block codes (e.g., 25E,26F)')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'cleaner_profiles'
        verbose_name = 'Cleaner Profile'
        verbose_name_plural = 'Cleaner Profiles'
    
    def __str__(self):
        return f"{self.user.name} - {self.staff_id}"


class Booking(models.Model):
    BOOKING_TYPE_CHOICES = (
        ('DEEP', 'Deep Cleaning'),
        ('STANDARD', 'Standard Cleaning'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('WAITING_FOR_CLEANER', 'Waiting for Cleaner'),
        ('ASSIGNED', 'Assigned'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    
    URGENCY_CHOICES = (
        ('NORMAL', 'Normal'),
        ('URGENT', 'Urgent'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('OFFLINE', 'Offline'),
        ('ONLINE', 'Online'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
    )
    
    block_validator = RegexValidator(
        regex=r'^\d{2}[A-Z]$',
        message='Block must be in format: 2 digits followed by 1 uppercase letter'
    )
    
    room_validator = RegexValidator(
        regex=r'^\d{2}[A-Z]-\d{2}-\d{2}$',
        message='Room number must be in correct format'
    )
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings', limit_choices_to={'role': 'STUDENT'})
    booking_type = models.CharField(max_length=10, choices=BOOKING_TYPE_CHOICES)
    preferred_date = models.DateField()
    preferred_time = models.TimeField()
    urgency_level = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='NORMAL')
    special_instructions = models.TextField(blank=True, null=True)
    block = models.CharField(max_length=10, validators=[block_validator])
    room_number = models.CharField(max_length=20, validators=[room_validator])
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='PENDING')
    assigned_cleaner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks', limit_choices_to={'role': 'CLEANER'})
    
    # Payment fields
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    payment_receipt = models.ImageField(upload_to='payment_receipts/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking #{self.id} - {self.student.name} - {self.booking_type}"
    
    @property
    def price(self):
        return 30 if self.booking_type == 'DEEP' else 20


class Issue(models.Model):
    ISSUE_TYPE_CHOICES = (
        ('PLUMBING', 'Plumbing'),
        ('ELECTRICAL', 'Electrical'),
        ('DAMAGE', 'Damage'),
        ('OTHER', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
    )
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='issues')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_issues', limit_choices_to={'role': 'CLEANER'})
    issue_type = models.CharField(max_length=20, choices=ISSUE_TYPE_CHOICES)
    description = models.TextField()
    photo_url = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='OPEN')
    assigned_staff = models.CharField(max_length=255, blank=True, null=True, help_text='Name or type of staff assigned to fix (e.g., Plumber, Electrician)')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'issues'
        verbose_name = 'Issue'
        verbose_name_plural = 'Issues'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Issue #{self.id} - {self.issue_type} - {self.status}"


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('NEW_BOOKING', 'New Booking Available'),
        ('BOOKING_ACCEPTED', 'Booking Accepted'),
        ('BOOKING_COMPLETED', 'Booking Completed'),
        ('GENERAL', 'General'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES, default='GENERAL')
    booking = models.ForeignKey('Booking', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification for {self.user.name} - {self.title}"


class PasswordResetCode(models.Model):
    """
    Model to store password reset verification codes (OTP)
    Codes expire after 10 minutes
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_codes')
    code = models.CharField(max_length=6, help_text='6-digit verification code')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(help_text='Code expires after 10 minutes')
    is_used = models.BooleanField(default=False, help_text='Whether this code has been used')
    
    class Meta:
        db_table = 'password_reset_codes'
        verbose_name = 'Password Reset Code'
        verbose_name_plural = 'Password Reset Codes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reset code for {self.user.email} - {'Used' if self.is_used else 'Valid'}"
    
    def is_expired(self):
        """Check if the code has expired"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if the code is valid (not used and not expired)"""
        return not self.is_used and not self.is_expired()
