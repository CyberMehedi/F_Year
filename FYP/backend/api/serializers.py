from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import datetime, timedelta, time
from .models import User, StudentProfile, CleanerProfile, Booking, Issue, Notification


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['student_id', 'block', 'room_number', 'phone']
        read_only_fields = ['student_id']


class CleanerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CleanerProfile
        fields = ['staff_id', 'phone', 'assigned_blocks', 'is_active']
        read_only_fields = ['staff_id', 'is_active']


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    cleaner_profile = CleanerProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'phone_number', 'is_active', 'date_joined', 'student_profile', 'cleaner_profile']
        read_only_fields = ['id', 'date_joined']


class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    student_id = serializers.CharField(required=True, validators=[
        RegexValidator(
            regex=r'^AIU\d{8}$',
            message='Student ID must be in format: AIU followed by 8 digits (e.g., AIU23102325)'
        )
    ])
    block = serializers.CharField(required=True, validators=[
        RegexValidator(
            regex=r'^\d{2}[A-Z]$',
            message='Block must be in format: 2 digits followed by 1 uppercase letter (e.g., 25E)'
        )
    ])
    room_number = serializers.CharField(required=True, validators=[
        RegexValidator(
            regex=r'^\d{2}[A-Z]-\d{2}-\d{2}$',
            message='Room number must be in format: 2 digits, 1 letter, dash, 2 digits, dash, 2 digits (e.g., 25E-04-10)'
        )
    ])
    phone = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, validators=[
        RegexValidator(
            regex=r'^\+?[1-9]\d{1,14}$',
            message='Phone number must be in E.164 format (e.g., +60123456789)'
        )
    ])
    
    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'confirm_password', 'phone_number', 'student_id', 'block', 'room_number', 'phone']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if student_id already exists
        if StudentProfile.objects.filter(student_id=attrs['student_id']).exists():
            raise serializers.ValidationError({"student_id": "This student ID is already registered."})
        
        return attrs
    
    def create(self, validated_data):
        # Remove profile fields and confirm_password
        student_id = validated_data.pop('student_id')
        block = validated_data.pop('block')
        room_number = validated_data.pop('room_number')
        phone = validated_data.pop('phone', '')
        phone_number = validated_data.pop('phone_number', '')
        validated_data.pop('confirm_password')
        
        # Create user
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role='STUDENT',
            phone_number=phone_number if phone_number else None
        )
        
        # Create student profile
        StudentProfile.objects.create(
            user=user,
            student_id=student_id,
            block=block,
            room_number=room_number,
            phone=phone
        )
        
        return user


class CleanerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    staff_id = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, validators=[
        RegexValidator(
            regex=r'^\+?[1-9]\d{1,14}$',
            message='Phone number must be in E.164 format (e.g., +60123456789)'
        )
    ])
    assigned_blocks = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'confirm_password', 'phone_number', 'staff_id', 'phone', 'assigned_blocks']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if staff_id already exists
        if CleanerProfile.objects.filter(staff_id=attrs['staff_id']).exists():
            raise serializers.ValidationError({"staff_id": "This staff ID is already registered."})
        
        return attrs
    
    def create(self, validated_data):
        # Remove profile fields and confirm_password
        staff_id = validated_data.pop('staff_id')
        phone = validated_data.pop('phone')
        phone_number = validated_data.pop('phone_number', '')
        assigned_blocks = validated_data.pop('assigned_blocks', '')
        validated_data.pop('confirm_password')
        
        # Create user
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role='CLEANER',
            phone_number=phone_number if phone_number else None
        )
        
        # Create cleaner profile
        CleanerProfile.objects.create(
            user=user,
            staff_id=staff_id,
            phone=phone,
            assigned_blocks=assigned_blocks
        )
        
        return user


class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    assigned_cleaner_name = serializers.CharField(source='assigned_cleaner.name', read_only=True, allow_null=True)
    price = serializers.IntegerField(read_only=True)
    payment_receipt_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'student', 'student_name', 'student_email', 'booking_type', 
            'preferred_date', 'preferred_time', 'urgency_level', 
            'special_instructions', 'block', 'room_number', 'status', 
            'assigned_cleaner', 'assigned_cleaner_name', 'price',
            'payment_method', 'payment_status', 'payment_receipt', 'payment_receipt_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'status', 'assigned_cleaner', 'payment_method', 
                            'payment_status', 'payment_receipt', 'created_at', 'updated_at']
    
    def get_payment_receipt_url(self, obj):
        if obj.payment_receipt:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.payment_receipt.url)
        return None
    
    def validate_preferred_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Preferred date cannot be in the past.")
        return value
    
    def validate_preferred_time(self, value):
        # Validate time slot is in 30-minute increments from 08:00 to 23:00
        allowed_times = []
        for hour in range(8, 24):  # 08:00 to 23:00
            allowed_times.append(time(hour, 0))
            allowed_times.append(time(hour, 30))
        
        if value not in allowed_times:
            raise serializers.ValidationError(
                "Time must be in 30-minute increments from 08:00 AM to 11:00 PM (23:00)."
            )
        
        return value
    
    def validate(self, attrs):
        # Check if the date-time combination is not in the past
        preferred_date = attrs.get('preferred_date')
        preferred_time = attrs.get('preferred_time')
        
        if preferred_date and preferred_time:
            booking_datetime = datetime.combine(preferred_date, preferred_time)
            now = timezone.now()
            
            # Convert to timezone-aware datetime
            if timezone.is_naive(booking_datetime):
                booking_datetime = timezone.make_aware(booking_datetime)
            
            if booking_datetime < now:
                raise serializers.ValidationError({
                    "preferred_time": "The selected date and time cannot be in the past."
                })
        
        return attrs


class IssueSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.name', read_only=True)
    booking_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Issue
        fields = [
            'id', 'booking', 'booking_details', 'reported_by', 'reported_by_name',
            'issue_type', 'description', 'photo_url', 'status', 'assigned_staff',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reported_by', 'created_at', 'updated_at']
    
    def get_booking_details(self, obj):
        return {
            'id': obj.booking.id,
            'room_number': obj.booking.room_number,
            'block': obj.booking.block,
            'booking_type': obj.booking.booking_type,
        }


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class ForgotPasswordRequestSerializer(serializers.Serializer):
    """
    Serializer for forgot password request
    Validates email and checks if user exists
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate that email exists in database"""
        from .models import User
        
        # Normalize email
        value = value.lower().strip()
        
        # Check if user exists
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No account found with this email address.")
        
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for resetting password with OTP code
    Validates email, code, and new password
    """
    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True, min_length=6, max_length=6)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate_email(self, value):
        """Validate that email exists"""
        from .models import User
        
        value = value.lower().strip()
        
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No account found with this email address.")
        
        return value
    
    def validate_code(self, value):
        """Validate that code is 6 digits"""
        if not value.isdigit():
            raise serializers.ValidationError("Code must contain only digits.")
        
        if len(value) != 6:
            raise serializers.ValidationError("Code must be exactly 6 digits.")
        
        return value
    
    def validate(self, data):
        """Validate that passwords match"""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        return data
