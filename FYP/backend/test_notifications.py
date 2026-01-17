"""
Test script for multi-channel notifications (SMS, WhatsApp, Email)

This script tests the notification system without requiring actual Twilio credentials.
In development mode, emails will print to console.
SMS and WhatsApp will log warnings about missing Twilio credentials.

To run: python manage.py shell < test_notifications.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel_cleaning.settings')
django.setup()

from api.utils.sms import send_email, send_sms, send_whatsapp, notify_all_channels
from api.models import User

print("\n" + "="*60)
print("TESTING MULTI-CHANNEL NOTIFICATION SYSTEM")
print("="*60)

# Test 1: Email (should work - prints to console in dev mode)
print("\n[TEST 1] Testing Email Notification...")
email_result = send_email(
    'test@example.com',
    'Test Email Subject',
    'This is a test email from AIU Hostel Cleaning System!'
)
print(f"Result: {email_result}")

# Test 2: SMS (will log warning about missing Twilio credentials)
print("\n[TEST 2] Testing SMS Notification...")
sms_result = send_sms(
    '+60123456789',
    'Test SMS: Your booking has been accepted!'
)
print(f"Result: {sms_result}")

# Test 3: WhatsApp (will log warning about missing Twilio credentials)
print("\n[TEST 3] Testing WhatsApp Notification...")
whatsapp_result = send_whatsapp(
    '+60123456789',
    'Test WhatsApp: Your cleaning service is complete!'
)
print(f"Result: {whatsapp_result}")

# Test 4: Multi-channel notification with real user (if exists)
print("\n[TEST 4] Testing Multi-Channel Notification...")
try:
    # Try to get first student user
    student = User.objects.filter(role='STUDENT').first()
    
    if student:
        print(f"Testing with user: {student.name} ({student.email})")
        results = notify_all_channels(
            student,
            "Test Multi-Channel Notification",
            "SMS/WhatsApp: This is a test notification!",
            "Email: This is a longer test notification sent via email channel."
        )
        print(f"Results: {results}")
    else:
        print("No student user found. Creating test user...")
        test_user = User(
            email='test-student@aiu.edu.my',
            name='Test Student',
            role='STUDENT',
            phone_number='+60123456789'
        )
        results = notify_all_channels(
            test_user,
            "Test Multi-Channel Notification",
            "SMS/WhatsApp: This is a test notification!",
            "Email: This is a longer test notification sent via email channel."
        )
        print(f"Results: {results}")
except Exception as e:
    print(f"Error testing multi-channel: {e}")

print("\n" + "="*60)
print("TESTING COMPLETE")
print("="*60)
print("\nNOTES:")
print("✅ Email: Should print to console in development mode")
print("⚠️  SMS: Will show warning 'Twilio credentials not configured'")
print("⚠️  WhatsApp: Will show warning 'Twilio WhatsApp credentials not configured'")
print("\nTo enable SMS and WhatsApp:")
print("1. Install Twilio: pip install twilio")
print("2. Set environment variables:")
print("   - TWILIO_ACCOUNT_SID")
print("   - TWILIO_AUTH_TOKEN")
print("   - TWILIO_PHONE_NUMBER")
print("   - TWILIO_WHATSAPP_NUMBER")
print("\nFor production email, update settings.py EMAIL_BACKEND to SMTP")
print("="*60 + "\n")
