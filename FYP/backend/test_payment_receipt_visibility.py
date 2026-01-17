"""
Test payment receipt visibility in API responses
"""
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from api.models import User, StudentProfile, CleanerProfile, Booking
from datetime import date, time


class PaymentReceiptAPITestCase(TestCase):
    """Test that payment receipt URLs are properly exposed in API responses"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create test users
        self.student_user = User.objects.create_user(
            email='student@test.com',
            name='Test Student',
            password='testpass123',
            role='STUDENT'
        )
        StudentProfile.objects.create(
            user=self.student_user,
            student_id='AIU12345678',
            block='25E',
            room_number='25E-04-10'
        )
        
        self.cleaner_user = User.objects.create_user(
            email='cleaner@test.com',
            name='Test Cleaner',
            password='testpass123',
            role='CLEANER'
        )
        CleanerProfile.objects.create(
            user=self.cleaner_user,
            staff_id='C001',
            phone='+60123456789'
        )
        
        self.admin_user = User.objects.create_superuser(
            email='admin@test.com',
            name='Test Admin',
            password='testpass123'
        )
        
        # Create a completed booking with payment receipt
        self.booking = Booking.objects.create(
            student=self.student_user,
            booking_type='DEEP',
            preferred_date=date.today(),
            preferred_time=time(10, 0),
            block='25E',
            room_number='25E-04-10',
            status='COMPLETED',
            assigned_cleaner=self.cleaner_user,
            payment_method='ONLINE',
            payment_status='PAID'
        )
        
        # Attach a mock payment receipt
        self.booking.payment_receipt = SimpleUploadedFile(
            "test_receipt.jpg",
            b"file_content",
            content_type="image/jpeg"
        )
        self.booking.save()
        
        self.client = APIClient()
    
    def test_cleaner_history_includes_payment_receipt(self):
        """Test that cleaner history endpoint returns payment_receipt_url"""
        self.client.force_authenticate(user=self.cleaner_user)
        response = self.client.get('/api/cleaner/history/')
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        
        task = response.data[0]
        self.assertIn('payment_receipt_url', task)
        if task['payment_receipt_url']:
            self.assertIn('payment_receipts/test_receipt', task['payment_receipt_url'])
    
    def test_cleaner_all_tasks_includes_payment_receipt(self):
        """Test that cleaner all tasks endpoint returns payment_receipt_url"""
        self.client.force_authenticate(user=self.cleaner_user)
        response = self.client.get('/api/cleaner/all-tasks/')
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        
        task = response.data[0]
        self.assertIn('payment_receipt_url', task)
    
    def test_student_history_includes_payment_receipt(self):
        """Test that student history endpoint returns payment_receipt_url"""
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get('/api/bookings/history/')
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        
        booking = response.data[0]
        self.assertIn('payment_receipt_url', booking)
        if booking['payment_receipt_url']:
            self.assertIn('payment_receipts/test_receipt', booking['payment_receipt_url'])
    
    def test_admin_payment_receipts_includes_payment_receipt(self):
        """Test that admin payment receipts endpoint returns payment_receipt"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/admin/payment-receipts/')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('receipts', response.data)
        self.assertTrue(len(response.data['receipts']) > 0)
        
        receipt = response.data['receipts'][0]
        self.assertIn('payment_receipt', receipt)
        if receipt['payment_receipt']:
            self.assertIn('payment_receipts/test_receipt', receipt['payment_receipt'])
    
    def test_booking_without_receipt_returns_none(self):
        """Test that bookings without receipts return None for payment_receipt_url"""
        # Create booking without receipt
        booking_no_receipt = Booking.objects.create(
            student=self.student_user,
            booking_type='STANDARD',
            preferred_date=date.today(),
            preferred_time=time(14, 0),
            block='25E',
            room_number='25E-04-10',
            status='COMPLETED',
            assigned_cleaner=self.cleaner_user,
            payment_method='OFFLINE',
            payment_status='PAID'
        )
        
        self.client.force_authenticate(user=self.cleaner_user)
        response = self.client.get('/api/cleaner/history/')
        
        self.assertEqual(response.status_code, 200)
        # Find the booking without receipt
        task_no_receipt = next(
            (t for t in response.data if t['id'] == booking_no_receipt.id),
            None
        )
        self.assertIsNotNone(task_no_receipt)
        self.assertIsNone(task_no_receipt['payment_receipt_url'])
