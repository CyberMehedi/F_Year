"""
Test Admin assign cleaner functionality
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from api.models import User, StudentProfile, CleanerProfile, Booking
from datetime import date, time


class AdminAssignCleanerTestCase(TestCase):
    """Test Admin can assign/reassign cleaners to bookings"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            email='admin@test.com',
            name='Test Admin',
            password='testpass123'
        )
        
        # Create student user
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
        
        # Create cleaner users
        self.cleaner1 = User.objects.create_user(
            email='cleaner1@test.com',
            name='Cleaner One',
            password='testpass123',
            role='CLEANER'
        )
        CleanerProfile.objects.create(
            user=self.cleaner1,
            staff_id='C001',
            phone='+60123456789'
        )
        
        self.cleaner2 = User.objects.create_user(
            email='cleaner2@test.com',
            name='Cleaner Two',
            password='testpass123',
            role='CLEANER'
        )
        CleanerProfile.objects.create(
            user=self.cleaner2,
            staff_id='C002',
            phone='+60123456790'
        )
        
        # Create booking
        self.booking = Booking.objects.create(
            student=self.student_user,
            booking_type='DEEP',
            preferred_date=date.today(),
            preferred_time=time(10, 0),
            block='25E',
            room_number='25E-04-10',
            status='WAITING_FOR_CLEANER'
        )
        
        self.client = APIClient()
    
    def test_admin_can_assign_cleaner_to_unassigned_booking(self):
        """Test admin can assign cleaner to booking without cleaner"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post(
            f'/api/bookings/{self.booking.id}/assign_cleaner/',
            {'cleaner_id': self.cleaner1.id}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.assigned_cleaner.id, self.cleaner1.id)
        self.assertEqual(self.booking.status, 'ASSIGNED')
    
    def test_admin_can_reassign_cleaner(self):
        """Test admin can reassign a different cleaner"""
        # First assignment
        self.booking.assigned_cleaner = self.cleaner1
        self.booking.status = 'ASSIGNED'
        self.booking.save()
        
        self.client.force_authenticate(user=self.admin_user)
        
        # Reassign to cleaner2
        response = self.client.post(
            f'/api/bookings/{self.booking.id}/assign_cleaner/',
            {'cleaner_id': self.cleaner2.id}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.assigned_cleaner.id, self.cleaner2.id)
        self.assertEqual(self.booking.status, 'ASSIGNED')
    
    def test_assign_cleaner_requires_admin(self):
        """Test non-admin cannot assign cleaners"""
        self.client.force_authenticate(user=self.student_user)
        
        response = self.client.post(
            f'/api/bookings/{self.booking.id}/assign_cleaner/',
            {'cleaner_id': self.cleaner1.id}
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_assign_invalid_cleaner_id(self):
        """Test assigning with invalid cleaner ID fails"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post(
            f'/api/bookings/{self.booking.id}/assign_cleaner/',
            {'cleaner_id': 99999}
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_assign_without_cleaner_id(self):
        """Test assigning without cleaner_id fails"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post(
            f'/api/bookings/{self.booking.id}/assign_cleaner/',
            {}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_cannot_assign_non_cleaner_user(self):
        """Test cannot assign a non-cleaner user"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post(
            f'/api/bookings/{self.booking.id}/assign_cleaner/',
            {'cleaner_id': self.student_user.id}
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_available_cleaners_endpoint(self):
        """Test admin can fetch available cleaners"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get('/api/admin/cleaners/available/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn('today_tasks', response.data[0])
        self.assertIn('active_tasks', response.data[0])
