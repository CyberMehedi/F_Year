from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # Auth views
    register_student, register_cleaner, login_view, get_current_user,
    forgot_password, reset_password,
    
    # Booking views
    BookingViewSet,
    
    # Cleaner views
    cleaner_new_requests, accept_booking, cleaner_today_tasks, cleaner_all_tasks, 
    cleaner_history, cleaner_stats,
    
    # Issue views
    IssueViewSet,
    
    # Admin views
    admin_dashboard_stats, admin_cleaners_list, admin_available_cleaners, admin_toggle_cleaner_status,
    admin_payment_receipts,
    
    # Notification views
    NotificationViewSet,
    
    # Profile views
    student_profile, cleaner_profile,
    
    # Payment views
    mark_offline_payment, upload_payment_receipt,
)

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'issues', IssueViewSet, basename='issue')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Auth endpoints
    path('auth/register/student/', register_student, name='register_student'),
    path('auth/register/cleaner/', register_cleaner, name='register_cleaner'),
    path('auth/login/', login_view, name='login'),
    path('auth/me/', get_current_user, name='current_user'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/forgot-password/', forgot_password, name='forgot_password'),
    path('auth/reset-password/', reset_password, name='reset_password'),
    
    # Cleaner endpoints
    path('cleaner/tasks/new/', cleaner_new_requests, name='cleaner_new_requests'),
    path('cleaner/bookings/<int:pk>/accept/', accept_booking, name='accept_booking'),
    path('cleaner/tasks/today/', cleaner_today_tasks, name='cleaner_today_tasks'),
    path('cleaner/tasks/all/', cleaner_all_tasks, name='cleaner_all_tasks'),
    path('cleaner/history/', cleaner_history, name='cleaner_history'),
    path('cleaner/stats/', cleaner_stats, name='cleaner_stats'),
    
    # Admin endpoints
    path('admin/stats/', admin_dashboard_stats, name='admin_stats'),
    path('admin/cleaners/', admin_cleaners_list, name='admin_cleaners_list'),
    path('admin/cleaners/available/', admin_available_cleaners, name='admin_available_cleaners'),
    path('admin/cleaners/<int:user_id>/toggle-status/', admin_toggle_cleaner_status, name='admin_toggle_cleaner'),
    path('admin/payment-receipts/', admin_payment_receipts, name='admin_payment_receipts'),
    
    # Profile endpoints
    path('profile/student/', student_profile, name='student_profile'),
    path('profile/cleaner/', cleaner_profile, name='cleaner_profile'),
    
    # Payment endpoints
    path('bookings/<int:pk>/payment/offline/', mark_offline_payment, name='mark_offline_payment'),
    path('bookings/<int:pk>/payment/receipt/', upload_payment_receipt, name='upload_payment_receipt'),
    
    # Router URLs
    path('', include(router.urls)),
]
