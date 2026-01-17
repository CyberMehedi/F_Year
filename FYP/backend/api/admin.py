from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudentProfile, CleanerProfile, Booking, Issue, Notification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'student_id', 'block', 'room_number', 'phone')
    search_fields = ('student_id', 'user__name', 'user__email', 'block', 'room_number')
    list_filter = ('block',)


@admin.register(CleanerProfile)
class CleanerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'staff_id', 'phone', 'is_active')
    search_fields = ('staff_id', 'user__name', 'user__email')
    list_filter = ('is_active',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'booking_type', 'preferred_date', 'preferred_time', 'status', 'urgency_level', 'assigned_cleaner')
    list_filter = ('status', 'booking_type', 'urgency_level', 'preferred_date')
    search_fields = ('student__name', 'room_number', 'block')
    date_hierarchy = 'preferred_date'


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'issue_type', 'status', 'reported_by', 'created_at')
    list_filter = ('issue_type', 'status', 'created_at')
    search_fields = ('description', 'booking__room_number')
    date_hierarchy = 'created_at'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__name', 'title', 'message')
    date_hierarchy = 'created_at'
