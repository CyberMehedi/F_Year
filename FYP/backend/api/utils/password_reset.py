"""
Utility functions for password reset functionality
- Generate random 6-digit OTP codes
- Send password reset emails
"""

import random
import logging
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def generate_reset_code():
    """
    Generate a random 6-digit verification code
    
    Returns:
        str: 6-digit code as string (e.g., "123456")
    """
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    logger.info(f"Generated new reset code: {code}")
    return code


def create_reset_code(user):
    """
    Create a new password reset code for user
    Invalidates any existing unused codes for this user
    
    Args:
        user: User object
        
    Returns:
        PasswordResetCode object
    """
    from api.models import PasswordResetCode
    
    # Delete any existing unused codes for this user
    PasswordResetCode.objects.filter(
        user=user,
        is_used=False
    ).delete()
    
    # Generate new code
    code = generate_reset_code()
    
    # Create expiration time (10 minutes from now)
    expires_at = timezone.now() + timedelta(minutes=10)
    
    # Create and save the reset code
    reset_code = PasswordResetCode.objects.create(
        user=user,
        code=code,
        expires_at=expires_at
    )
    
    logger.info(f"Created reset code for user {user.email}, expires at {expires_at}")
    
    return reset_code


def send_reset_code_email(user, code):
    """
    Send password reset code via email
    
    Args:
        user: User object
        code: 6-digit verification code
        
    Returns:
        dict: Response with success status
    """
    subject = "Password Reset Code - AIU Hostel Cleaning"
    
    # Plain text message
    message = f"""
Hi {user.name},

You recently requested to reset your password for your AIU Hostel Cleaning account.

Your password reset code is: {code}

This code will expire in 10 minutes.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
AIU Hostel Cleaning Service Team
    """
    
    # HTML message for better formatting
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi <strong>{user.name}</strong>,</p>
            
            <p style="font-size: 15px; color: #555; margin-bottom: 20px;">
                You recently requested to reset your password for your AIU Hostel Cleaning account.
            </p>
            
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Your verification code is:</p>
                <p style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 15px 0; font-family: 'Courier New', monospace;">
                    {code}
                </p>
                <p style="font-size: 13px; color: #999; margin-top: 10px;">⏰ Valid for 10 minutes</p>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="font-size: 14px; color: #856404; margin: 0;">
                    <strong>⚠️ Security Notice:</strong> If you did not request this password reset, 
                    please ignore this email or contact support immediately.
                </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>AIU Hostel Cleaning Service Team</strong>
            </p>
        </div>
        
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
            html_message=html_message
        )
        
        logger.info(f"Reset code email sent successfully to {user.email}")
        return {'success': True, 'message': 'Reset code sent to your email'}
        
    except Exception as e:
        logger.error(f"Failed to send reset code email to {user.email}: {str(e)}")
        return {'success': False, 'error': f'Failed to send email: {str(e)}'}


def send_password_reset_confirmation_email(user):
    """
    Send confirmation email after successful password reset
    
    Args:
        user: User object
        
    Returns:
        dict: Response with success status
    """
    subject = "Password Reset Successful - AIU Hostel Cleaning"
    
    # Plain text message
    message = f"""
Hi {user.name},

Your password has been reset successfully.

You can now log in to your AIU Hostel Cleaning account using your new password.

If you did not make this change, please contact our support team immediately.

Best regards,
AIU Hostel Cleaning Service Team
    """
    
    # HTML message
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Password Reset Successful</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi <strong>{user.name}</strong>,</p>
            
            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="font-size: 15px; color: #155724; margin: 0;">
                    <strong>✅ Success!</strong> Your password has been reset successfully.
                </p>
            </div>
            
            <p style="font-size: 15px; color: #555; margin-bottom: 20px;">
                You can now log in to your AIU Hostel Cleaning account using your new password.
            </p>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="font-size: 14px; color: #856404; margin: 0;">
                    <strong>⚠️ Security Alert:</strong> If you did not make this change, 
                    please contact our support team immediately at support@aiu.edu.my
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/login" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 15px 40px; text-decoration: none; 
                          border-radius: 25px; display: inline-block; font-weight: bold;">
                    Log In Now
                </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                <strong>AIU Hostel Cleaning Service Team</strong>
            </p>
        </div>
        
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
            html_message=html_message
        )
        
        logger.info(f"Password reset confirmation email sent to {user.email}")
        return {'success': True}
        
    except Exception as e:
        logger.error(f"Failed to send confirmation email to {user.email}: {str(e)}")
        return {'success': False, 'error': str(e)}


def verify_reset_code(email, code):
    """
    Verify if the reset code is valid for the given email
    
    Args:
        email: User's email address
        code: 6-digit verification code
        
    Returns:
        tuple: (success: bool, message: str, reset_code: PasswordResetCode or None)
    """
    from api.models import User, PasswordResetCode
    
    try:
        # Get user
        user = User.objects.get(email=email.lower().strip())
        
        # Get the most recent unused reset code for this user
        reset_code = PasswordResetCode.objects.filter(
            user=user,
            code=code,
            is_used=False
        ).order_by('-created_at').first()
        
        if not reset_code:
            logger.warning(f"Invalid reset code attempt for {email}")
            return (False, "Invalid verification code.", None)
        
        if reset_code.is_expired():
            logger.warning(f"Expired reset code used for {email}")
            return (False, "Verification code has expired. Please request a new one.", None)
        
        logger.info(f"Valid reset code verified for {email}")
        return (True, "Code verified successfully.", reset_code)
        
    except User.DoesNotExist:
        logger.warning(f"Reset code verification attempt for non-existent email: {email}")
        return (False, "No account found with this email address.", None)
