# Multi-Channel Notification System Setup Guide

## Overview

Your AIU Hostel Cleaning System now supports **three notification channels**:

1. ✅ **Email** - Ready to use (prints to console in dev mode)
2. ⚠️ **SMS** - Needs Twilio installation and credentials
3. ⚠️ **WhatsApp** - Needs Twilio installation and credentials

## Current Status

### ✅ What's Already Working

- **In-app notifications** - Bell icon shows real-time alerts
- **Email backend configured** - Prints emails to console in development
- **Multi-channel integration** - Code fully implemented in views.py
- **All notification events**:
  - When student creates booking → All cleaners notified via SMS/WhatsApp/Email
  - When cleaner accepts → Student notified via SMS/WhatsApp/Email
  - When booking status changes to IN_PROGRESS → Student notified
  - When booking completed → Student notified via SMS/WhatsApp/Email

### ⚠️ What Needs Configuration

1. **Twilio Installation** (for SMS & WhatsApp)
2. **Twilio Credentials** (Account SID, Auth Token, Phone Numbers)
3. **Email SMTP** (for production - currently using console backend)

---

## Setup Instructions

### Option 1: Development Mode (Current Setup)

**What works:**
- Email notifications print to console
- SMS/WhatsApp log warnings but don't fail
- All booking logic works perfectly

**To test:**
```bash
cd backend
python test_notifications.py
```

### Option 2: Enable Twilio for SMS & WhatsApp

#### Step 1: Fix Twilio Installation Issue

The installation failed due to Windows MAX_PATH limitation. Solutions:

**Solution A: Enable Long Paths (Recommended)**
```powershell
# Run PowerShell as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
                 -Name "LongPathsEnabled" `
                 -Value 1 `
                 -PropertyType DWORD `
                 -Force

# Restart computer, then:
pip install twilio
```

**Solution B: Use Python 3.11+ (supports long paths)**
```bash
# Check Python version
python --version

# If version is 3.11+, try:
pip install twilio --prefer-binary
```

**Solution C: Use Virtual Environment with Short Path**
```bash
# Create venv in C:\venv (short path)
python -m venv C:\venv\aiu
C:\venv\aiu\Scripts\activate
pip install twilio
```

#### Step 2: Get Twilio Credentials

1. **Sign up for Twilio**: https://www.twilio.com/try-twilio
   - Free trial includes $15 credit
   - Enough for ~500 SMS messages

2. **Get your credentials** from Twilio Console:
   - Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Auth Token: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Get a phone number**:
   - Go to Phone Numbers → Buy a Number
   - Select a number with SMS and Voice capabilities
   - For Malaysia, choose a +60 number if available

4. **Setup WhatsApp (Optional)**:
   - Go to Messaging → Try WhatsApp
   - Join sandbox: Send "join <sandbox-code>" to Twilio's WhatsApp number
   - Production requires WhatsApp Business approval

#### Step 3: Configure Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+14155238886  # Twilio sandbox number
```

Load environment variables in Django:

```bash
# Install python-dotenv
pip install python-dotenv
```

Update `backend/hostel_cleaning/settings.py`:

```python
# Add at top of settings.py
from dotenv import load_dotenv
load_dotenv()

# The rest stays the same - already configured
```

#### Step 4: Test Twilio Integration

```bash
cd backend
python manage.py shell
```

```python
from api.utils.sms import send_sms, send_whatsapp

# Test SMS
result = send_sms('+60123456789', 'Test SMS from AIU Hostel Cleaning!')
print(result)

# Test WhatsApp (make sure number joined sandbox)
result = send_whatsapp('+60123456789', 'Test WhatsApp from AIU Hostel Cleaning!')
print(result)
```

### Option 3: Enable Production Email

#### Step 1: Choose Email Provider

**Option A: Gmail (Easiest for testing)**
```python
# In settings.py, update:
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')  # your-email@gmail.com
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')  # app-specific password
```

**Get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search "App passwords"
4. Generate password for "Mail"
5. Copy 16-character password

**Option B: SendGrid (Better for production)**
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = os.environ.get('SENDGRID_API_KEY')
```

#### Step 2: Add Email Credentials to .env

```bash
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
```

#### Step 3: Test Email

```bash
python manage.py shell
```

```python
from api.utils.sms import send_email

result = send_email(
    'recipient@example.com',
    'Test Email',
    'This is a test email from AIU Hostel Cleaning!'
)
print(result)
```

---

## Testing the Complete System

### 1. Test Booking Creation (Notifies All Cleaners)

```bash
# Start backend
cd backend
python manage.py runserver

# Start frontend
cd frontend
npm start
```

1. Log in as **Student**
2. Create new booking
3. Check:
   - In-app notification appears for cleaners ✅
   - Console shows email output ✅
   - Logs show SMS/WhatsApp attempts ⚠️

### 2. Test Booking Acceptance (Notifies Student)

1. Log in as **Cleaner**
2. Go to New Requests
3. Click "Accept Task"
4. Check:
   - In-app notification appears for student ✅
   - Student receives email (check console) ✅
   - Student receives SMS/WhatsApp (if Twilio configured) 📱

### 3. Test Booking Completion (Notifies Student)

1. As cleaner, update booking status to "COMPLETED"
2. Check:
   - Student receives all three notifications ✅

---

## Notification Message Examples

### SMS/WhatsApp (Short format)
```
🔔 New Booking Available!
Standard Cleaning for 25E-04-10
📅 2024-01-15 at 14:00
💰 Price: RM30
Be the first to accept!
```

### Email (Detailed format)
```
Subject: New Cleaning Request Available

A new cleaning request is available!

Service Details:
- Type: Standard Cleaning
- Location: 25E - 04-10
- Date: 2024-01-15
- Time: 14:00
- Price: RM30
- Urgency: NORMAL

Special Instructions:
Please focus on bathroom cleaning

Log in to the AIU Hostel Cleaning app to accept this booking.
First cleaner to accept gets the job!
```

---

## Troubleshooting

### Issue: Twilio won't install

**Error**: `OSError: [Errno 2] No such file or directory`

**Solution**: Follow "Step 1: Fix Twilio Installation Issue" above

### Issue: SMS not sending

**Check:**
1. Twilio installed? `pip list | grep twilio`
2. Environment variables set? Check `.env` file
3. Phone number in E.164 format? Must start with `+` (e.g., `+60123456789`)
4. Check Django logs for error messages

### Issue: Email not sending

**Check:**
1. EMAIL_BACKEND configured in settings.py?
2. SMTP credentials correct in `.env`?
3. Gmail: Using app-specific password (not regular password)?
4. Firewall blocking port 587?

### Issue: WhatsApp not working

**Check:**
1. Recipient joined Twilio sandbox? Must send "join <code>" first
2. Using correct WhatsApp number format? `whatsapp:+60123456789`
3. For production: WhatsApp Business account approved?

---

## Cost Considerations

### Twilio Free Trial
- $15 credit
- ~500 SMS messages
- Good for testing and small-scale deployment

### Twilio Pricing (After trial)
- SMS: ~$0.0075 per message (Malaysia)
- WhatsApp: ~$0.005 per message
- Example: 1000 bookings = $15-20/month

### Email
- Gmail: Free (with daily limits)
- SendGrid: 100 emails/day free, then $19.95/month for 50k emails

---

## Production Checklist

Before deploying to production:

- [ ] Enable long paths on server (if Windows)
- [ ] Install Twilio: `pip install twilio`
- [ ] Set environment variables (use secrets manager)
- [ ] Configure email SMTP (not console backend)
- [ ] Test all notification channels
- [ ] Add phone_number field to registration forms (frontend)
- [ ] Update User model validation for phone numbers
- [ ] Set up monitoring/logging for failed notifications
- [ ] Configure rate limiting to avoid spam
- [ ] Add unsubscribe option (email)
- [ ] Comply with SMS regulations (opt-in/opt-out)

---

## Summary

✅ **What's Done:**
- Multi-channel notification system fully coded
- Email notifications working (console mode)
- SMS/WhatsApp functions implemented
- All booking events trigger notifications
- Error handling and logging in place
- Graceful degradation (works without Twilio)

⚠️ **What's Needed:**
- Install Twilio package (when path issue resolved)
- Add Twilio credentials to environment variables
- (Optional) Configure production SMTP for emails
- (Optional) Add phone number field to registration forms

📝 **Next Steps:**
1. Choose development (console email) or production setup
2. If production: Follow Option 2 & 3 above
3. Run test_notifications.py to verify
4. Test complete booking flow end-to-end

---

**Questions?** Check logs in `backend/` terminal for detailed error messages.
