from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from .models import User, StudentProfile, CleanerProfile, Booking, Issue, Notification
from .serializers import (
    UserSerializer, StudentRegistrationSerializer, CleanerRegistrationSerializer,
    BookingSerializer, IssueSerializer, NotificationSerializer,
    StudentProfileSerializer, CleanerProfileSerializer
)
from .permissions import IsAdmin, IsCleaner, IsStudent, IsOwnerOrAdmin
from .utils.sms import send_sms, send_bulk_sms, format_phone_number, send_whatsapp, send_email, notify_all_channels
from .utils.email_notifications import (
    send_welcome_email,
    send_booking_created_email,
    send_booking_accepted_email,
    send_booking_in_progress_email,
    send_booking_completed_email,
    send_payment_received_email
)

logger = logging.getLogger(__name__)


# ============== AUTH VIEWS ==============

@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    """
    Register a new student user
    """
    serializer = StudentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Create welcome notification
        Notification.objects.create(
            user=user,
            title="Welcome to AIU Hostel Cleaning Service",
            message="Your account has been created successfully. You can now book cleaning services for your room."
        )
        
        # Send HTML welcome email
        email_result = send_welcome_email(user)
        
        if email_result['success']:
            logger.info(f"Welcome email sent to new student: {user.email}")
        else:
            logger.warning(f"Failed to send welcome email to {user.email}: {email_result.get('error')}")
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_cleaner(request):
    """
    Register a new cleaner user
    """
    serializer = CleanerRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Create welcome notification
        Notification.objects.create(
            user=user,
            title="Welcome to AIU Hostel Cleaning Service",
            message="Your cleaner account has been created successfully. You will receive task assignments from admin."
        )
        
        # Send HTML welcome email
        email_result = send_welcome_email(user)
        
        if email_result['success']:
            logger.info(f"Welcome email sent to new cleaner: {user.email}")
        else:
            logger.warning(f"Failed to send welcome email to {user.email}: {email_result.get('error')}")
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user and return tokens
    """
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role')
    
    if not email or not password or not role:
        return Response({
            'error': 'Please provide email, password and role'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(email=email, password=password)
    
    if user is None:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    if user.role != role:
        return Response({
            'error': f'This account is not registered as a {role.lower()}'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if not user.is_active:
        return Response({
            'error': 'This account has been deactivated'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current authenticated user details
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Request password reset - Send 6-digit OTP to user's email
    
    POST /api/auth/forgot-password/
    Body: {"email": "user@example.com"}
    
    Returns:
        - 200: OTP sent successfully
        - 400: Invalid email or validation error
    """
    from .serializers import ForgotPasswordRequestSerializer
    from .utils.password_reset import create_reset_code, send_reset_code_email
    
    serializer = ForgotPasswordRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    try:
        # Get user
        user = User.objects.get(email=email.lower().strip())
        
        # Create reset code
        reset_code = create_reset_code(user)
        
        # Send email with code
        email_result = send_reset_code_email(user, reset_code.code)
        
        if email_result['success']:
            logger.info(f"Password reset code sent to {user.email}")
            return Response({
                'message': 'A verification code has been sent to your email. Please check your inbox.',
                'email': user.email
            }, status=status.HTTP_200_OK)
        else:
            logger.error(f"Failed to send reset code to {user.email}: {email_result.get('error')}")
            return Response({
                'error': 'Failed to send verification code. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except User.DoesNotExist:
        # For security, return same message even if user doesn't exist
        logger.warning(f"Password reset attempt for non-existent email: {email}")
        return Response({
            'message': 'If an account exists with this email, a verification code has been sent.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error in forgot_password: {str(e)}")
        return Response({
            'error': 'An error occurred. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password using OTP code
    
    POST /api/auth/reset-password/
    Body: {
        "email": "user@example.com",
        "code": "123456",
        "new_password": "newpassword123",
        "confirm_password": "newpassword123"
    }
    
    Returns:
        - 200: Password reset successful
        - 400: Invalid code, expired code, or validation error
    """
    from .serializers import ResetPasswordSerializer
    from .utils.password_reset import verify_reset_code, send_password_reset_confirmation_email
    
    serializer = ResetPasswordSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    code = serializer.validated_data['code']
    new_password = serializer.validated_data['new_password']
    
    try:
        # Verify the reset code
        success, message, reset_code = verify_reset_code(email, code)
        
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user and update password
        user = User.objects.get(email=email.lower().strip())
        user.set_password(new_password)
        user.save()
        
        # Mark the reset code as used
        reset_code.is_used = True
        reset_code.save()
        
        logger.info(f"Password reset successful for {user.email}")
        
        # Send confirmation email
        send_password_reset_confirmation_email(user)
        
        return Response({
            'message': 'Your password has been reset successfully. You can now log in with your new password.'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        logger.error(f"User not found during password reset: {email}")
        return Response({
            'error': 'An error occurred. Please try again.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in reset_password: {str(e)}")
        return Response({
            'error': 'An error occurred. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============== BOOKING VIEWS ==============

class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bookings
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'ADMIN':
            # Admin can see all bookings
            queryset = Booking.objects.all()
        elif user.role == 'STUDENT':
            # Students can only see their own bookings
            queryset = Booking.objects.filter(student=user)
        elif user.role == 'CLEANER':
            # Cleaners can see bookings assigned to them
            queryset = Booking.objects.filter(assigned_cleaner=user)
        else:
            queryset = Booking.objects.none()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(preferred_date=date_filter)
        
        # Filter by booking type
        type_filter = self.request.query_params.get('type', None)
        if type_filter:
            queryset = queryset.filter(booking_type=type_filter)
        
        return queryset.select_related('student', 'assigned_cleaner')
    
    def perform_create(self, serializer):
        # Save booking with WAITING_FOR_CLEANER status
        booking = serializer.save(student=self.request.user, status='WAITING_FOR_CLEANER')
        
        # Notify ALL active cleaners about the new booking
        active_cleaners = User.objects.filter(role='CLEANER', is_active=True)
        
        for cleaner in active_cleaners:
            # Create in-app notification
            Notification.objects.create(
                user=cleaner,
                title="New Cleaning Request Available",
                message=f"New {booking.get_booking_type_display()} request for {booking.block} - {booking.room_number} on {booking.preferred_date} at {booking.preferred_time}. Be the first to accept!",
                notification_type='NEW_BOOKING',
                booking=booking
            )
        
        # Send HTML email notifications to all cleaners
        email_results = send_booking_created_email(booking, active_cleaners)
        successful_emails = sum(1 for result in email_results if result.get('success'))
        logger.info(f"Booking {booking.id} created: {successful_emails}/{len(active_cleaners)} email notifications sent")
        
        # Create notification for student
        Notification.objects.create(
            user=self.request.user,
            title="Booking Created Successfully",
            message=f"Your {booking.get_booking_type_display()} booking for {booking.preferred_date} at {booking.preferred_time} has been created. Waiting for a cleaner to accept.",
            notification_type='GENERAL',
            booking=booking
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def assign_cleaner(self, request, pk=None):
        """
        Admin endpoint to assign a cleaner to a booking
        Admin-assigned bookings bypass the cleaner acceptance flow
        """
        booking = self.get_object()
        cleaner_id = request.data.get('cleaner_id')
        
        if not cleaner_id:
            return Response({'error': 'cleaner_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cleaner = User.objects.get(id=cleaner_id, role='CLEANER', is_active=True)
        except User.DoesNotExist:
            return Response({'error': 'Cleaner not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
        
        # Store old status to track if this is a new assignment
        old_status = booking.status
        
        # Assign cleaner (admin assignment is final)
        booking.assigned_cleaner = cleaner
        booking.status = 'ASSIGNED'
        booking.save()
        
        logger.info(f"Admin assigned cleaner {cleaner.name} to booking {booking.id}")
        
        # Delete all pending NEW_BOOKING notifications (since admin assigned)
        if old_status == 'WAITING_FOR_CLEANER':
            deleted_count = Notification.objects.filter(
                booking=booking,
                notification_type='NEW_BOOKING'
            ).delete()[0]
            logger.info(f"Deleted {deleted_count} pending cleaner notifications for booking {booking.id}")
        
        # Create notification for student
        Notification.objects.create(
            user=booking.student,
            title="Cleaner Assigned by Admin",
            message=f"Admin has assigned cleaner {cleaner.name} to your {booking.get_booking_type_display()} booking for {booking.preferred_date} at {booking.preferred_time}.",
            notification_type='BOOKING_ACCEPTED',
            booking=booking
        )
        
        # Create notification for assigned cleaner
        Notification.objects.create(
            user=cleaner,
            title="New Task Assigned by Admin",
            message=f"You have been assigned a {booking.get_booking_type_display()} task for {booking.block} - {booking.room_number} on {booking.preferred_date} at {booking.preferred_time}. This assignment is final.",
            notification_type='BOOKING_ACCEPTED',
            booking=booking
        )
        
        # Send email notification to cleaner
        try:
            from .utils.sms import send_email
            email_result = send_email(
                cleaner.email,
                "New Task Assigned - AIU Hostel Cleaning",
                f"You have been assigned a {booking.get_booking_type_display()} task for {booking.block} - {booking.room_number} on {booking.preferred_date} at {booking.preferred_time}. Please check your dashboard for details."
            )
            if email_result['success']:
                logger.info(f"Assignment email sent to cleaner: {cleaner.email}")
        except Exception as e:
            logger.error(f"Failed to send assignment email: {str(e)}")
        
        # Send email notification to student
        try:
            from .utils.sms import send_email
            email_result = send_email(
                booking.student.email,
                "Cleaner Assigned - AIU Hostel Cleaning",
                f"A cleaner ({cleaner.name}) has been assigned to your booking for {booking.preferred_date} at {booking.preferred_time}."
            )
            if email_result['success']:
                logger.info(f"Assignment confirmation email sent to student: {booking.student.email}")
        except Exception as e:
            logger.error(f"Failed to send student confirmation email: {str(e)}")
        
        return Response({
            'message': f'Cleaner {cleaner.name} successfully assigned to booking',
            'booking': BookingSerializer(booking).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """
        Update booking status (Admin or assigned cleaner)
        """
        booking = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({'error': 'status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check permissions
        if request.user.role == 'CLEANER' and booking.assigned_cleaner != request.user:
            return Response({'error': 'You can only update your assigned bookings'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.user.role == 'STUDENT':
            # Students can only cancel their own bookings
            if booking.student != request.user or new_status != 'CANCELLED':
                return Response({'error': 'Students can only cancel their own bookings'}, status=status.HTTP_403_FORBIDDEN)
        
        old_status = booking.status
        booking.status = new_status
        booking.save()
        
        # Create notification for student
        Notification.objects.create(
            user=booking.student,
            title="Booking Status Updated",
            message=f"Your booking status has been updated from {old_status} to {new_status}."
        )
        
        # Send HTML email notification if status changed to COMPLETED
        if new_status == 'COMPLETED':
            email_result = send_booking_completed_email(booking)
            if email_result['success']:
                logger.info(f"Completion email sent for booking {booking.id}")
            else:
                logger.warning(f"Failed to send completion email for booking {booking.id}: {email_result.get('error')}")
        
        # Send HTML email notification if status changed to IN_PROGRESS
        elif new_status == 'IN_PROGRESS':
            email_result = send_booking_in_progress_email(booking)
            if email_result['success']:
                logger.info(f"In-progress email sent for booking {booking.id}")
            else:
                logger.warning(f"Failed to send in-progress email for booking {booking.id}: {email_result.get('error')}")
        
        return Response(BookingSerializer(booking).data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsStudent])
    def my_bookings(self, request):
        """
        Get current user's bookings (students only)
        """
        bookings = Booking.objects.filter(student=request.user).order_by('-created_at')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsStudent])
    def history(self, request):
        """
        Get completed bookings for current student
        """
        bookings = Booking.objects.filter(
            student=request.user,
            status__in=['COMPLETED', 'CANCELLED']
        ).order_by('-created_at')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)


# ============== CLEANER VIEWS ==============

@api_view(['GET'])
@permission_classes([IsCleaner])
def cleaner_new_requests(request):
    """
    Get new task requests waiting for cleaner acceptance
    """
    tasks = Booking.objects.filter(
        status='WAITING_FOR_CLEANER'
    ).order_by('preferred_date', 'preferred_time')
    
    serializer = BookingSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsCleaner])
def accept_booking(request, pk):
    """
    Accept a booking - First come first serve
    """
    from django.db import transaction
    
    try:
        with transaction.atomic():
            # Lock the row to prevent race conditions
            booking = Booking.objects.select_for_update().get(
                pk=pk,
                status='WAITING_FOR_CLEANER'
            )
            
            # Check if already assigned (another cleaner was faster)
            if booking.assigned_cleaner is not None:
                return Response(
                    {'error': 'This task has already been accepted by another cleaner'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Assign the booking to current cleaner
            booking.assigned_cleaner = request.user
            booking.status = 'ASSIGNED'
            booking.save()
            
            # IMPORTANT: Notify ONLY the student who created this booking
            # NOT all students - only booking.student
            logger.info(f"Creating notification for booking owner ONLY: {booking.student.email}")
            
            Notification.objects.create(
                user=booking.student,  # Single student - booking owner
                title="Cleaner Accepted Your Request",
                message=f"Cleaner {request.user.name} has accepted your {booking.get_booking_type_display()} request for {booking.preferred_date} at {booking.preferred_time}.",
                notification_type='BOOKING_ACCEPTED',
                booking=booking
            )
            
            # Send HTML email notification to ONLY the student who created this booking
            logger.info(f"Sending acceptance email to booking owner ONLY: {booking.student.email} (Booking ID: {booking.id})")
            email_result = send_booking_accepted_email(booking)
            if email_result['success']:
                logger.info(f"✅ Booking acceptance email sent successfully to {booking.student.email}")
            else:
                logger.warning(f"❌ Failed to send acceptance email to {booking.student.email}: {email_result.get('error')}")
            
            # Delete notifications for other cleaners
            Notification.objects.filter(
                booking=booking,
                notification_type='NEW_BOOKING'
            ).exclude(user=request.user).delete()
            
            # Update current cleaner's notification to accepted
            Notification.objects.filter(
                booking=booking,
                user=request.user,
                notification_type='NEW_BOOKING'
            ).update(
                title="Task Accepted",
                message=f"You accepted the {booking.get_booking_type_display()} task for {booking.block} - {booking.room_number}.",
                is_read=True
            )
            
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
            
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found or already accepted'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsCleaner])
def cleaner_today_tasks(request):
    """
    Get today's tasks for cleaner
    """
    today = timezone.now().date()
    tasks = Booking.objects.filter(
        assigned_cleaner=request.user,
        preferred_date=today,
        status__in=['ASSIGNED', 'IN_PROGRESS']
    ).order_by('preferred_time')
    
    serializer = BookingSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsCleaner])
def cleaner_all_tasks(request):
    """
    Get all tasks for cleaner
    """
    tasks = Booking.objects.filter(
        assigned_cleaner=request.user
    ).order_by('-preferred_date', '-preferred_time')
    
    serializer = BookingSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsCleaner])
def cleaner_history(request):
    """
    Get completed tasks for cleaner
    """
    tasks = Booking.objects.filter(
        assigned_cleaner=request.user,
        status='COMPLETED'
    ).order_by('-updated_at')
    
    serializer = BookingSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsCleaner])
def cleaner_stats(request):
    """
    Get statistics for cleaner
    """
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    
    # Completed today
    completed_today = Booking.objects.filter(
        assigned_cleaner=request.user,
        status='COMPLETED',
        updated_at__date=today
    ).count()
    
    # Completed this week
    completed_week = Booking.objects.filter(
        assigned_cleaner=request.user,
        status='COMPLETED',
        updated_at__date__gte=week_start
    ).count()
    
    # Completed this month
    completed_month = Booking.objects.filter(
        assigned_cleaner=request.user,
        status='COMPLETED',
        updated_at__date__gte=month_start
    ).count()
    
    # Booking type distribution
    type_distribution = Booking.objects.filter(
        assigned_cleaner=request.user,
        status='COMPLETED'
    ).values('booking_type').annotate(count=Count('id'))
    
    # Pending issues
    pending_issues = Issue.objects.filter(
        reported_by=request.user,
        status='OPEN'
    ).count()
    
    return Response({
        'completed_today': completed_today,
        'completed_week': completed_week,
        'completed_month': completed_month,
        'type_distribution': list(type_distribution),
        'pending_issues': pending_issues
    })


# ============== ISSUE VIEWS ==============

class IssueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing issues/maintenance tickets
    """
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'ADMIN':
            # Admin can see all issues
            queryset = Issue.objects.all()
        elif user.role == 'CLEANER':
            # Cleaners can see issues they reported
            queryset = Issue.objects.filter(reported_by=user)
        else:
            # Students can see issues related to their bookings
            queryset = Issue.objects.filter(booking__student=user)
        
        return queryset.select_related('booking', 'reported_by')
    
    def perform_create(self, serializer):
        issue = serializer.save(reported_by=self.request.user)
        
        # Create notification for admin (get first admin user)
        admin_users = User.objects.filter(role='ADMIN', is_active=True)
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                title="New Issue Reported",
                message=f"A {issue.get_issue_type_display()} issue has been reported by {self.request.user.name} for booking #{issue.booking.id}."
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def update_status(self, request, pk=None):
        """
        Admin endpoint to update issue status
        """
        issue = self.get_object()
        new_status = request.data.get('status')
        assigned_staff = request.data.get('assigned_staff', issue.assigned_staff)
        
        if not new_status:
            return Response({'error': 'status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        issue.status = new_status
        issue.assigned_staff = assigned_staff
        issue.save()
        
        # Create notification for reporter
        Notification.objects.create(
            user=issue.reported_by,
            title="Issue Status Updated",
            message=f"The {issue.get_issue_type_display()} issue you reported has been updated to {new_status}."
        )
        
        return Response(IssueSerializer(issue).data)


# ============== ADMIN VIEWS ==============

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard_stats(request):
    """
    Get statistics for admin dashboard
    """
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    
    # Total bookings today
    bookings_today = Booking.objects.filter(preferred_date=today).count()
    
    # Total bookings this week
    bookings_week = Booking.objects.filter(preferred_date__gte=week_start).count()
    
    # Pending bookings (not assigned)
    pending_bookings = Booking.objects.filter(status='PENDING').count()
    
    # Active cleaners
    active_cleaners = User.objects.filter(role='CLEANER', is_active=True).count()
    
    # Open issues
    open_issues = Issue.objects.filter(status='OPEN').count()
    
    # Total students
    total_students = User.objects.filter(role='STUDENT', is_active=True).count()
    
    return Response({
        'bookings_today': bookings_today,
        'bookings_week': bookings_week,
        'pending_bookings': pending_bookings,
        'active_cleaners': active_cleaners,
        'open_issues': open_issues,
        'total_students': total_students
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_cleaners_list(request):
    """
    Get list of all cleaners with their profiles
    """
    cleaners = User.objects.filter(role='CLEANER').select_related('cleaner_profile')
    serializer = UserSerializer(cleaners, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_available_cleaners(request):
    """
    Get list of active cleaners available for assignment
    Returns cleaner info with current task count
    """
    # Get active cleaners
    cleaners = User.objects.filter(role='CLEANER', is_active=True).select_related('cleaner_profile')
    
    # Build response with task counts
    cleaners_data = []
    for cleaner in cleaners:
        # Count today's tasks
        today_tasks = Booking.objects.filter(
            assigned_cleaner=cleaner,
            preferred_date=timezone.now().date(),
            status__in=['ASSIGNED', 'IN_PROGRESS']
        ).count()
        
        # Count total active tasks
        active_tasks = Booking.objects.filter(
            assigned_cleaner=cleaner,
            status__in=['ASSIGNED', 'IN_PROGRESS']
        ).count()
        
        cleaner_data = UserSerializer(cleaner).data
        cleaner_data['today_tasks'] = today_tasks
        cleaner_data['active_tasks'] = active_tasks
        cleaners_data.append(cleaner_data)
    
    # Sort by least busy (fewest active tasks)
    cleaners_data.sort(key=lambda x: x['active_tasks'])
    
    return Response(cleaners_data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_toggle_cleaner_status(request, user_id):
    """
    Toggle cleaner active/inactive status
    """
    try:
        cleaner = User.objects.get(id=user_id, role='CLEANER')
    except User.DoesNotExist:
        return Response({'error': 'Cleaner not found'}, status=status.HTTP_404_NOT_FOUND)
    
    cleaner.is_active = not cleaner.is_active
    cleaner.save()
    
    return Response(UserSerializer(cleaner).data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_payment_receipts(request):
    """
    Get all payment receipts for admin view (read-only)
    """
    # Fetch all bookings with payments
    bookings = Booking.objects.filter(
        status='COMPLETED',
        payment_status='PAID'
    ).select_related('student', 'assigned_cleaner').order_by('-updated_at')
    
    # Build payment receipt data
    receipts_data = []
    for booking in bookings:
        receipt_info = {
            'id': booking.id,
            'booking_id': booking.id,
            'student_name': booking.student.name,
            'student_email': booking.student.email,
            'cleaner_name': booking.assigned_cleaner.name if booking.assigned_cleaner else 'N/A',
            'cleaner_email': booking.assigned_cleaner.email if booking.assigned_cleaner else 'N/A',
            'payment_method': booking.payment_method,
            'payment_status': booking.payment_status,
            'payment_receipt': request.build_absolute_uri(booking.payment_receipt.url) if booking.payment_receipt else None,
            'booking_type': booking.get_booking_type_display(),
            'amount': booking.price,
            'room_number': booking.room_number,
            'block': booking.block,
            'service_date': booking.preferred_date,
            'payment_date': booking.updated_at,
            'created_at': booking.created_at,
        }
        receipts_data.append(receipt_info)
    
    logger.info(f"Admin {request.user.email} accessed payment receipts - Total: {len(receipts_data)}")
    
    return Response({
        'count': len(receipts_data),
        'receipts': receipts_data
    })


# ============== NOTIFICATION VIEWS ==============

class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark notification as read
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """
        Mark all notifications as read
        """
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Get count of unread notifications
        """
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'count': count})


# ============== PROFILE VIEWS ==============

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def student_profile(request):
    """
    Get or update student profile
    """
    if request.user.role != 'STUDENT':
        return Response({'error': 'Only students can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        profile = request.user.student_profile
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return flat structure matching frontend expectations
        user_data = UserSerializer(request.user).data
        return Response(user_data)
    
    elif request.method in ['PUT', 'PATCH']:
        # Log incoming data for debugging
        print(f"Profile update request data: {request.data}")
        
        # Update user name if provided
        if 'name' in request.data and request.data['name']:
            request.user.name = request.data['name']
            request.user.save()
            print(f"Updated user name to: {request.user.name}")
        
        # Update profile fields (phone, block, room_number)
        profile_data = {
            key: value for key, value in request.data.items() 
            if key in ['phone', 'block', 'room_number'] and value is not None
        }
        
        if profile_data:
            profile_serializer = StudentProfileSerializer(profile, data=profile_data, partial=True)
            if profile_serializer.is_valid():
                profile_serializer.save()
                print(f"Updated profile fields: {profile_data}")
            else:
                print(f"Profile validation errors: {profile_serializer.errors}")
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Return updated user data with profile
        user_data = UserSerializer(request.user).data
        print(f"Returning updated profile: {user_data}")
        return Response(user_data)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def cleaner_profile(request):
    """
    Get or update cleaner profile
    """
    if request.user.role != 'CLEANER':
        return Response({'error': 'Only cleaners can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        profile = request.user.cleaner_profile
    except CleanerProfile.DoesNotExist:
        return Response({'error': 'Cleaner profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Return flat structure matching frontend expectations
        user_data = UserSerializer(request.user).data
        return Response(user_data)
    
    elif request.method in ['PUT', 'PATCH']:
        # Log incoming data for debugging
        print(f"Cleaner profile update request data: {request.data}")
        
        # Update user name if provided
        if 'name' in request.data and request.data['name']:
            request.user.name = request.data['name']
            request.user.save()
            print(f"Updated cleaner name to: {request.user.name}")
        
        # Update profile fields (phone, assigned_blocks)
        profile_data = {
            key: value for key, value in request.data.items() 
            if key in ['phone', 'assigned_blocks'] and value is not None
        }
        
        if profile_data:
            profile_serializer = CleanerProfileSerializer(profile, data=profile_data, partial=True)
            if profile_serializer.is_valid():
                profile_serializer.save()
                print(f"Updated cleaner profile fields: {profile_data}")
            else:
                print(f"Cleaner profile validation errors: {profile_serializer.errors}")
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Return updated user data with profile
        user_data = UserSerializer(request.user).data
        print(f"Returning updated cleaner profile: {user_data}")
        return Response(user_data)


# ============== PAYMENT VIEWS ==============

@api_view(['POST'])
@permission_classes([IsStudent])
def mark_offline_payment(request, pk):
    """
    Mark booking as paid with offline payment method
    """
    try:
        booking = Booking.objects.get(pk=pk, student=request.user)
        
        # Check if booking is completed
        if booking.status != 'COMPLETED':
            return Response(
                {'error': 'Payment can only be made for completed bookings'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already paid
        if booking.payment_status == 'PAID':
            return Response(
                {'error': 'Payment has already been completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as offline payment and paid
        booking.payment_method = 'OFFLINE'
        booking.payment_status = 'PAID'
        booking.save()
        
        logger.info(f"Booking {booking.id} marked as paid (offline) by student {request.user.id}")
        
        # Send email notification to cleaner (non-blocking)
        try:
            email_result = send_payment_received_email(booking)
            if email_result.get('success'):
                logger.info(f"Payment notification email sent to cleaner {booking.assigned_cleaner.email} for booking {booking.id}")
            else:
                logger.warning(f"Failed to send payment notification email for booking {booking.id}: {email_result.get('error')}")
        except Exception as e:
            logger.error(f"Exception while sending payment notification email for booking {booking.id}: {str(e)}")
            # Continue regardless of email failure
        
        return Response({
            'message': 'Payment completed (Offline)',
            'booking': BookingSerializer(booking).data
        })
    
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsStudent])
def upload_payment_receipt(request, pk):
    """
    Upload payment receipt for online payment
    """
    try:
        booking = Booking.objects.get(pk=pk, student=request.user)
        
        # Check if booking is completed
        if booking.status != 'COMPLETED':
            return Response(
                {'error': 'Payment can only be made for completed bookings'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already paid
        if booking.payment_status == 'PAID':
            return Response(
                {'error': 'Payment has already been completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if receipt file is provided
        if 'receipt' not in request.FILES:
            return Response(
                {'error': 'Receipt file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save receipt and update payment info
        booking.payment_method = 'ONLINE'
        booking.payment_receipt = request.FILES['receipt']
        booking.payment_status = 'PAID'
        booking.save()
        
        logger.info(f"Payment receipt uploaded for booking {booking.id} by student {request.user.id}")
        
        # Send email notification to cleaner (non-blocking)
        try:
            email_result = send_payment_received_email(booking)
            if email_result.get('success'):
                logger.info(f"Payment notification email sent to cleaner {booking.assigned_cleaner.email} for booking {booking.id}")
            else:
                logger.warning(f"Failed to send payment notification email for booking {booking.id}: {email_result.get('error')}")
        except Exception as e:
            logger.error(f"Exception while sending payment notification email for booking {booking.id}: {str(e)}")
            # Continue regardless of email failure
        
        return Response({
            'message': 'Payment receipt uploaded successfully',
            'booking': BookingSerializer(booking).data
        })
    
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found'},
            status=status.HTTP_404_NOT_FOUND
        )
