import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def send_sms(to_phone_number, message):
    """
    SMS notifications disabled - Using email only
    
    Args:
        to_phone_number (str): Recipient's phone number
        message (str): SMS message content
        
    Returns:
        dict: Response indicating SMS is disabled
    """
    logger.info(f"SMS disabled. Would have sent to {to_phone_number}: {message}")
    return {'success': False, 'error': 'SMS notifications disabled - using email only'}


def send_bulk_sms(phone_numbers, message):
    """
    SMS notifications disabled - Using email only
    
    Args:
        phone_numbers (list): List of phone numbers
        message (str): SMS message content
        
    Returns:
        dict: Summary indicating SMS is disabled
    """
    logger.info(f"Bulk SMS disabled. Would have sent to {len(phone_numbers)} recipients")
    return {
        'successful': [],
        'failed': [{'error': 'SMS notifications disabled'} for _ in phone_numbers]
    }


def send_whatsapp(to_phone_number, message):
    """
    WhatsApp notifications disabled - Using email only
    
    Args:
        to_phone_number (str): Recipient's phone number
        message (str): WhatsApp message content
        
    Returns:
        dict: Response indicating WhatsApp is disabled
    """
    logger.info(f"WhatsApp disabled. Would have sent to {to_phone_number}: {message}")
    return {'success': False, 'error': 'WhatsApp notifications disabled - using email only'}


def send_email(to_email, subject, message):
    """
    Send email notification
    
    Args:
        to_email (str): Recipient's email address
        subject (str): Email subject
        message (str): Email message content
        
    Returns:
        dict: Response with success status or error
    """
    from django.core.mail import send_mail
    from django.conf import settings
    
    try:
        if not to_email:
            logger.warning("Email not sent: Email address is empty")
            return {'success': False, 'error': 'Email address is required'}
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return {'success': True}
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return {'success': False, 'error': str(e)}


def notify_all_channels(user, subject, sms_message, email_message=None):
    """
    Send notification via Email only (SMS/WhatsApp disabled)
    
    Args:
        user: User object
        subject: Email subject
        sms_message: Message (not used - kept for compatibility)
        email_message: Email message content
        
    Returns:
        dict: Results for email channel
    """
    results = {
        'email': {'success': False}
    }
    
    # Send Email
    if user.email:
        results['email'] = send_email(
            user.email,
            subject,
            email_message if email_message else sms_message
        )
    
    logger.info(f"Email notification sent to user {user.id}: {results['email']['success']}")
    
    return results


def format_phone_number(phone_number, country_code='+60'):
    """
    Format phone number to E.164 format
    
    Args:
        phone_number (str): Phone number to format
        country_code (str): Country code (default: +60 for Malaysia)
        
    Returns:
        str: Formatted phone number in E.164 format
    """
    if not phone_number:
        return None
    
    # Remove spaces, dashes, and parentheses
    phone_number = phone_number.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    
    # If already has +, return as is
    if phone_number.startswith('+'):
        return phone_number
    
    # If starts with 0, remove it and add country code
    if phone_number.startswith('0'):
        phone_number = phone_number[1:]
    
    # Add country code
    return f"{country_code}{phone_number}"
