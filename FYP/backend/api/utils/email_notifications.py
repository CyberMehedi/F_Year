"""
Email notification utilities with HTML templates
"""
import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def send_html_email(to_email, subject, html_content, text_content=None):
    """
    Send HTML email with plain text fallback
    
    Args:
        to_email (str): Recipient's email address
        subject (str): Email subject
        html_content (str): HTML email content
        text_content (str): Plain text fallback (optional)
        
    Returns:
        dict: Response with success status or error
    """
    try:
        if not to_email:
            logger.warning("Email not sent: Email address is empty")
            return {'success': False, 'error': 'Email address is required'}
        
        # Create plain text version if not provided
        if not text_content:
            text_content = strip_tags(html_content)
        
        # Create email message
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email]
        )
        
        # Attach HTML content
        email.attach_alternative(html_content, "text/html")
        
        # Send email
        email.send(fail_silently=False)
        
        logger.info(f"HTML email sent successfully to {to_email}")
        return {'success': True}
        
    except Exception as e:
        logger.error(f"Failed to send HTML email to {to_email}: {str(e)}")
        return {'success': False, 'error': str(e)}


def generate_email_html(title, greeting, content_blocks, footer_text=None):
    """
    Generate HTML email template
    
    Args:
        title (str): Email title
        greeting (str): Greeting text (e.g., "Dear John")
        content_blocks (list): List of content paragraphs/blocks
        footer_text (str): Optional footer text
        
    Returns:
        str: HTML email content
    """
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }}
            .content {{
                padding: 30px;
            }}
            .greeting {{
                font-size: 18px;
                font-weight: 500;
                margin-bottom: 20px;
                color: #667eea;
            }}
            .info-box {{
                background-color: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }}
            .info-box strong {{
                color: #667eea;
            }}
            .button {{
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: 500;
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #6c757d;
                border-top: 1px solid #e9ecef;
            }}
            .footer p {{
                margin: 5px 0;
            }}
            ul {{
                padding-left: 20px;
            }}
            ul li {{
                margin: 8px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏢 AIU Hostel Cleaning Service</h1>
            </div>
            <div class="content">
                <p class="greeting">{greeting}</p>
    """
    
    # Add content blocks
    for block in content_blocks:
        html += f"                {block}\n"
    
    html += """
            </div>
            <div class="footer">
                <p><strong>AIU Hostel Cleaning Service</strong></p>
                <p>Albukhary International University</p>
                <p>Jln Tun Razak, Bandar Alor Setar, 05200 Alor Setar, Kedah</p>
    """
    
    if footer_text:
        html += f"                <p style='margin-top: 15px;'>{footer_text}</p>\n"
    
    html += """
            </div>
        </div>
    </body>
    </html>
    """
    
    return html


def send_welcome_email(user):
    """
    Send welcome email to new user
    
    Args:
        user: User object
        
    Returns:
        dict: Response with success status
    """
    subject = "Welcome to AIU Hostel Cleaning Service! 🎉"
    
    if user.role == 'STUDENT':
        content_blocks = [
            "<p>Welcome to <strong>AIU Hostel Cleaning Service</strong>! We're excited to have you on board.</p>",
            "<p>Your student account has been successfully created. You can now book professional cleaning services for your hostel room with just a few clicks.</p>",
            "<div class='info-box'>",
            "<strong>Your Account Details:</strong><br>",
            f"📧 Email: {user.email}<br>",
            f"👤 Name: {user.name}<br>",
            f"🎓 Role: Student",
            "</div>",
            "<p><strong>Available Services:</strong></p>",
            "<ul>",
            "<li>✨ <strong>Standard Cleaning</strong> - RM20<br>Essential room cleaning and tidying. <strong>WITHOUT washroom</strong>.</li>",
            "<li>🌟 <strong>Deep Cleaning</strong> - RM30<br>Comprehensive cleaning <strong>WITH washroom</strong> and thorough sanitization.</li>",
            "</ul>",
            "<p><strong>How It Works:</strong></p>",
            "<ol>",
            "<li>Log in to your account</li>",
            "<li>Select your preferred cleaning service</li>",
            "<li>Choose date and time</li>",
            "<li>Submit booking and wait for cleaner acceptance</li>",
            "<li>Track your booking status in real-time</li>",
            "</ol>",
            "<p>You'll receive email notifications at every step of your booking journey.</p>",
        ]
    else:  # CLEANER
        content_blocks = [
            "<p>Welcome to <strong>AIU Hostel Cleaning Service</strong>! We're thrilled to have you join our cleaning team.</p>",
            "<p>Your cleaner account has been successfully created. You can now start accepting and managing cleaning tasks.</p>",
            "<div class='info-box'>",
            "<strong>Your Account Details:</strong><br>",
            f"📧 Email: {user.email}<br>",
            f"👤 Name: {user.name}<br>",
            f"🧹 Role: Cleaner",
            "</div>",
            "<p><strong>Your Responsibilities:</strong></p>",
            "<ul>",
            "<li>📋 View new cleaning requests in real-time</li>",
            "<li>✅ Accept available bookings (first-come-first-serve)</li>",
            "<li>📍 Navigate to assigned rooms on time</li>",
            "<li>🧼 Complete cleaning tasks professionally</li>",
            "<li>✨ Update task status after completion</li>",
            "</ul>",
            "<p><strong>How It Works:</strong></p>",
            "<ol>",
            "<li>Receive email notifications for new cleaning requests</li>",
            "<li>Log in and view available bookings</li>",
            "<li>Click 'Accept Task' to claim a booking</li>",
            "<li>Complete the cleaning service</li>",
            "<li>Update status to 'Completed'</li>",
            "</ol>",
            "<p>You'll earn competitive rates for each completed task. Payment details will be provided by the admin.</p>",
        ]
    
    html_content = generate_email_html(
        title=subject,
        greeting=f"Dear {user.name},",
        content_blocks=content_blocks,
        footer_text="If you have any questions, please don't hesitate to contact our support team."
    )
    
    return send_html_email(user.email, subject, html_content)


def send_booking_created_email(booking, cleaners):
    """
    Send email to all cleaners about new booking
    
    Args:
        booking: Booking object
        cleaners: List of User objects (cleaners)
        
    Returns:
        list: List of results for each cleaner
    """
    results = []
    subject = f"🔔 New Cleaning Request Available - {booking.get_booking_type_display()}"
    
    for cleaner in cleaners:
        content_blocks = [
            "<p>A new cleaning request is available for acceptance!</p>",
            "<div class='info-box'>",
            "<strong>📋 Booking Details:</strong><br>",
            f"🏷️ Type: <strong>{booking.get_booking_type_display()}</strong><br>",
            f"📍 Location: <strong>{booking.block} - {booking.room_number}</strong><br>",
            f"📅 Date: <strong>{booking.preferred_date.strftime('%B %d, %Y')}</strong><br>",
            f"🕐 Time: <strong>{booking.preferred_time.strftime('%I:%M %p')}</strong><br>",
            f"💰 Payment: <strong>RM{booking.price}</strong><br>",
            f"⚡ Urgency: <strong>{booking.get_urgency_level_display()}</strong>",
            "</div>",
        ]
        
        if booking.special_instructions:
            content_blocks.append(
                f"<p><strong>Special Instructions:</strong><br>{booking.special_instructions}</p>"
            )
        
        content_blocks.extend([
            "<p style='color: #e74c3c; font-weight: 500;'>⏰ First come, first serve! Log in now to accept this booking.</p>",
            "<p>This booking will be assigned to the first cleaner who accepts it.</p>",
        ])
        
        html_content = generate_email_html(
            title=subject,
            greeting=f"Dear {cleaner.name},",
            content_blocks=content_blocks,
            footer_text="Log in to the AIU Hostel Cleaning app to accept this booking."
        )
        
        result = send_html_email(cleaner.email, subject, html_content)
        results.append(result)
        
    return results


def send_booking_accepted_email(booking):
    """
    Send email to student when booking is accepted
    
    IMPORTANT: This function sends email to ONLY the student who created the booking.
    It does NOT loop through all students - only booking.student receives the email.
    
    Args:
        booking: Booking object
        
    Returns:
        dict: Response with success status
    """
    # Debug log to confirm single recipient
    logger.info(f"Sending booking acceptance email to ONLY: {booking.student.email} (Booking ID: {booking.id})")
    
    subject = f"✅ Your Cleaning Request Has Been Accepted!"
    
    content_blocks = [
        "<p>Great news! A cleaner has accepted your cleaning request.</p>",
        "<div class='info-box'>",
        "<strong>📋 Booking Details:</strong><br>",
        f"🏷️ Service: <strong>{booking.get_booking_type_display()}</strong><br>",
        f"📍 Location: <strong>{booking.block} - {booking.room_number}</strong><br>",
        f"📅 Date: <strong>{booking.preferred_date.strftime('%B %d, %Y')}</strong><br>",
        f"🕐 Time: <strong>{booking.preferred_time.strftime('%I:%M %p')}</strong><br>",
        f"💰 Price: <strong>RM{booking.price}</strong><br>",
        f"🧹 Cleaner: <strong>{booking.assigned_cleaner.name}</strong>",
        "</div>",
        "<p><strong>What's Next?</strong></p>",
        "<ul>",
        "<li>The cleaner will arrive at your room at the scheduled time</li>",
        "<li>Please ensure your room is accessible</li>",
        "<li>You'll receive updates as the cleaning progresses</li>",
        "<li>Payment will be processed after completion</li>",
        "</ul>",
        "<p>You can track the status of your booking in the <strong>My Bookings</strong> section.</p>",
    ]
    
    html_content = generate_email_html(
        title=subject,
        greeting=f"Dear {booking.student.name},",
        content_blocks=content_blocks,
        footer_text="Thank you for using AIU Hostel Cleaning Service!"
    )
    
    return send_html_email(booking.student.email, subject, html_content)


def send_booking_in_progress_email(booking):
    """
    Send email when booking status changes to IN_PROGRESS
    
    IMPORTANT: This function sends email to ONLY the student who created the booking.
    
    Args:
        booking: Booking object
        
    Returns:
        dict: Response with success status
    """
    # Debug log to confirm single recipient
    logger.info(f"Sending in-progress email to ONLY: {booking.student.email} (Booking ID: {booking.id})")
    
    subject = f"🧹 Cleaning Service In Progress"
    
    content_blocks = [
        "<p>Your cleaning service is now in progress!</p>",
        "<div class='info-box'>",
        "<strong>📋 Service Details:</strong><br>",
        f"🏷️ Type: <strong>{booking.get_booking_type_display()}</strong><br>",
        f"📍 Location: <strong>{booking.block} - {booking.room_number}</strong><br>",
        f"🧹 Cleaner: <strong>{booking.assigned_cleaner.name}</strong><br>",
        f"⏰ Started: <strong>Just now</strong>",
        "</div>",
        "<p>The cleaner has started working on your room. You'll receive another notification once the service is completed.</p>",
    ]
    
    html_content = generate_email_html(
        title=subject,
        greeting=f"Dear {booking.student.name},",
        content_blocks=content_blocks,
        footer_text="Thank you for your patience!"
    )
    
    return send_html_email(booking.student.email, subject, html_content)


def send_booking_completed_email(booking):
    """
    Send email when booking is completed
    
    IMPORTANT: This function sends email to ONLY the student who created the booking.
    
    Args:
        booking: Booking object
        
    Returns:
        dict: Response with success status
    """
    # Debug log to confirm single recipient
    logger.info(f"Sending completion email to ONLY: {booking.student.email} (Booking ID: {booking.id})")
    
    subject = f"✨ Cleaning Service Completed!"
    
    content_blocks = [
        "<p>Your cleaning service has been completed successfully!</p>",
        "<div class='info-box'>",
        "<strong>📋 Service Summary:</strong><br>",
        f"🏷️ Type: <strong>{booking.get_booking_type_display()}</strong><br>",
        f"📍 Location: <strong>{booking.block} - {booking.room_number}</strong><br>",
        f"📅 Date: <strong>{booking.preferred_date.strftime('%B %d, %Y')}</strong><br>",
        f"🧹 Cleaner: <strong>{booking.assigned_cleaner.name}</strong><br>",
        f"💰 Amount: <strong>RM{booking.price}</strong>",
        "</div>",
        "<p><strong>We hope you're satisfied with our service!</strong></p>",
        "<p>Your room should now be clean and fresh. If you have any concerns about the cleaning quality, please contact our support team within 24 hours.</p>",
        "<p>You can view this booking in your <strong>History</strong> section.</p>",
        "<p style='margin-top: 30px;'>Thank you for choosing AIU Hostel Cleaning Service. We look forward to serving you again!</p>",
    ]
    
    html_content = generate_email_html(
        title=subject,
        greeting=f"Dear {booking.student.name},",
        content_blocks=content_blocks,
        footer_text="Rate your experience and help us improve our service!"
    )
    
    return send_html_email(booking.student.email, subject, html_content)


def send_payment_received_email(booking):
    """
    Send email to cleaner when student completes payment
    
    Args:
        booking: Booking object with payment information
        
    Returns:
        dict: Response with success status or error
    """
    from datetime import datetime
    
    # Ensure there's an assigned cleaner
    if not booking.assigned_cleaner:
        logger.warning(f"No cleaner assigned for booking {booking.id}, cannot send payment notification")
        return {'success': False, 'error': 'No cleaner assigned'}
    
    # Log payment notification
    logger.info(f"Sending payment notification to cleaner: {booking.assigned_cleaner.email} (Booking ID: {booking.id})")
    
    # Determine payment method display
    payment_method_display = booking.get_payment_method_display() if booking.payment_method else 'N/A'
    payment_date = datetime.now().strftime('%B %d, %Y at %I:%M %p')
    
    subject = f"💰 Payment Received for Completed Cleaning Job"
    
    content_blocks = [
        "<p>Great news! The student has completed the payment for the cleaning job you completed.</p>",
        "<div class='info-box'>",
        "<strong>💳 Payment Details:</strong><br>",
        f"📋 Booking ID: <strong>#{booking.id}</strong><br>",
        f"👤 Student: <strong>{booking.student.name}</strong><br>",
        f"📧 Student Email: <strong>{booking.student.email}</strong><br>",
        f"📍 Location: <strong>{booking.block} - {booking.room_number}</strong><br>",
        f"🏷️ Service Type: <strong>{booking.get_booking_type_display()}</strong><br>",
        f"💰 Amount: <strong>RM{booking.price}</strong><br>",
        f"💳 Payment Method: <strong>{payment_method_display}</strong><br>",
        f"✅ Payment Status: <strong>Paid</strong><br>",
        f"🕐 Payment Date: <strong>{payment_date}</strong>",
        "</div>",
        "<p><strong>Job Summary:</strong></p>",
        "<p>",
        f"Service Date: <strong>{booking.preferred_date.strftime('%B %d, %Y')}</strong><br>",
        f"Service Time: <strong>{booking.preferred_time.strftime('%I:%M %p')}</strong>",
        "</p>",
        "<p style='margin-top: 20px;'>Thank you for your excellent service! The payment has been successfully processed.</p>",
        "<p>If you have any questions about this payment, please contact the administration office.</p>",
    ]
    
    html_content = generate_email_html(
        title=subject,
        greeting=f"Dear {booking.assigned_cleaner.name},",
        content_blocks=content_blocks,
        footer_text="Keep up the great work! Your dedication helps maintain our high service standards."
    )
    
    return send_html_email(booking.assigned_cleaner.email, subject, html_content)
