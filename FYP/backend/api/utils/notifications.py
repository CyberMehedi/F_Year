import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def send_sms(phone_number, message):
    """
    Send SMS notification
    This is a placeholder that logs the SMS. 
    Integrate with Twilio, AWS SNS, or other SMS provider later.
    """
    try:
        # Log the SMS (replace with actual SMS provider integration)
        logger.info(f"SMS to {phone_number}: {message}")
        
        # TODO: Uncomment when Twilio is configured
        # from twilio.rest import Client
        # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        # message = client.messages.create(
        #     body=message,
        #     from_=settings.TWILIO_PHONE_NUMBER,
        #     to=phone_number
        # )
        # return True
        
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
        return False


def send_whatsapp(phone_number, message):
    """
    Send WhatsApp notification via Twilio
    """
    try:
        # Log the WhatsApp message
        logger.info(f"WhatsApp to {phone_number}: {message}")
        
        # TODO: Uncomment when Twilio is configured
        # from twilio.rest import Client
        # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        # message = client.messages.create(
        #     body=message,
        #     from_=f'whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}',
        #     to=f'whatsapp:{phone_number}'
        # )
        # return True
        
        return True
    except Exception as e:
        logger.error(f"Failed to send WhatsApp to {phone_number}: {str(e)}")
        return False


def send_email_notification(email, subject, message):
    """
    Send email notification
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        logger.info(f"Email sent to {email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        return False


def notify_all_channels(user, subject, message):
    """
    Send notification via all available channels (SMS, WhatsApp, Email)
    """
    results = {
        'email': False,
        'sms': False,
        'whatsapp': False
    }
    
    # Send email
    if user.email:
        results['email'] = send_email_notification(user.email, subject, message)
    
    # Send SMS
    if hasattr(user, 'phone_number') and user.phone_number:
        results['sms'] = send_sms(user.phone_number, message)
    
    # Send WhatsApp
    if hasattr(user, 'phone_number') and user.phone_number:
        results['whatsapp'] = send_whatsapp(user.phone_number, message)
    
    return results


def notify_booking_created(booking, cleaners):
    """
    Notify all cleaners when a new booking is created
    """
    message = (
        f"New Cleaning Request Available!\n"
        f"Type: {booking.get_booking_type_display()}\n"
        f"Location: {booking.block} - {booking.room_number}\n"
        f"Date: {booking.preferred_date} at {booking.preferred_time}\n"
        f"Be the first to accept!"
    )
    subject = "New Cleaning Request Available"
    
    results = []
    for cleaner in cleaners:
        result = notify_all_channels(cleaner, subject, message)
        results.append({'cleaner': cleaner.name, **result})
    
    return results


def notify_booking_accepted(booking):
    """
    Notify student when cleaner accepts their booking
    """
    message = (
        f"Good news! Your cleaning request has been accepted.\n"
        f"Cleaner: {booking.assigned_cleaner.name}\n"
        f"Type: {booking.get_booking_type_display()}\n"
        f"Date: {booking.preferred_date} at {booking.preferred_time}\n"
        f"Location: {booking.block} - {booking.room_number}"
    )
    subject = "Cleaning Request Accepted"
    
    return notify_all_channels(booking.student, subject, message)


def notify_booking_completed(booking):
    """
    Notify student when booking is completed
    """
    message = (
        f"Your cleaning service has been completed!\n"
        f"Type: {booking.get_booking_type_display()}\n"
        f"Cleaner: {booking.assigned_cleaner.name}\n"
        f"Date: {booking.preferred_date}\n"
        f"Thank you for using AIU Hostel Cleaning Service!"
    )
    subject = "Cleaning Service Completed"
    
    return notify_all_channels(booking.student, subject, message)


def notify_booking_in_progress(booking):
    """
    Notify student when cleaner starts the job
    """
    message = (
        f"Your cleaner has started working!\n"
        f"Cleaner: {booking.assigned_cleaner.name}\n"
        f"Type: {booking.get_booking_type_display()}\n"
        f"Location: {booking.block} - {booking.room_number}"
    )
    subject = "Cleaning Service Started"
    
    return notify_all_channels(booking.student, subject, message)
