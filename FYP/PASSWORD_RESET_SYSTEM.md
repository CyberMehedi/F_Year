# 🔐 Password Reset System - Complete Implementation Guide

## Overview

This document describes the complete **Forgot Password + Reset Password via Email Code** system implemented in the AIU Hostel Cleaning application (Django + React).

---

## 🎯 Features Implemented

### Backend (Django REST Framework)

1. **PasswordResetCode Model**
   - Stores 6-digit verification codes
   - Automatic expiration after 10 minutes
   - Tracks usage status
   - Linked to User via ForeignKey

2. **API Endpoints**
   - `POST /api/auth/forgot-password/` - Send OTP to email
   - `POST /api/auth/reset-password/` - Verify OTP and reset password

3. **Email System**
   - Professional HTML email templates
   - Plain text fallback for compatibility
   - Reset code email with styling
   - Password change confirmation email

4. **Security Features**
   - Code expires after 10 minutes
   - One-time use codes (marked as used after reset)
   - Old codes automatically invalidated when new code requested
   - Password validation (Django's built-in validators)
   - Email normalization (lowercase, trimmed)

### Frontend (React)

1. **ForgotPassword Page** (`/forgot-password`)
   - Email input with validation
   - Success/error message display
   - Link to reset password page
   - Professional gradient UI

2. **ResetPassword Page** (`/reset-password`)
   - Email input
   - 6-digit code input (formatted)
   - New password input with show/hide
   - Confirm password input with validation
   - Auto-redirect to login after success

3. **Login Page Enhancement**
   - "Forgot password?" link added

---

## 📁 Files Created/Modified

### Backend Files

#### Created:
1. **`backend/api/models.py`**
   - Added `PasswordResetCode` model

2. **`backend/api/serializers.py`**
   - Added `ForgotPasswordRequestSerializer`
   - Added `ResetPasswordSerializer`

3. **`backend/api/views.py`**
   - Added `forgot_password()` view
   - Added `reset_password()` view

4. **`backend/api/urls.py`**
   - Added `/auth/forgot-password/` route
   - Added `/auth/reset-password/` route

5. **`backend/api/utils/password_reset.py`** (NEW FILE)
   - `generate_reset_code()` - Generate 6-digit OTP
   - `create_reset_code()` - Create and save reset code
   - `send_reset_code_email()` - Send code via email
   - `send_password_reset_confirmation_email()` - Confirmation email
   - `verify_reset_code()` - Validate code and expiration

6. **`backend/api/migrations/0004_passwordresetcode.py`**
   - Database migration for new model

### Frontend Files

#### Created:
1. **`frontend/src/pages/auth/ForgotPassword.js`**
   - Complete forgot password page with UI

2. **`frontend/src/pages/auth/ResetPassword.js`**
   - Complete reset password page with UI

#### Modified:
1. **`frontend/src/App.js`**
   - Added routes for `/forgot-password` and `/reset-password`
   - Imported new components

2. **`frontend/src/api/api.js`**
   - Added `forgotPassword()` API function
   - Added `resetPassword()` API function

3. **`frontend/src/pages/auth/Login.js`**
   - Added "Forgot password?" link

---

## 🔄 User Flow

### Step 1: Request Password Reset

1. User clicks "Forgot password?" on login page
2. User enters email address
3. System checks if email exists in database
4. If email exists:
   - Generate 6-digit random code (e.g., "123456")
   - Save code to database with 10-minute expiration
   - Send professional HTML email with code
   - Show success message
5. If email doesn't exist:
   - Return generic success message (security best practice)

### Step 2: Reset Password

1. User receives email with 6-digit code
2. User navigates to reset password page
3. User enters:
   - Email address
   - 6-digit code
   - New password
   - Confirm password
4. System validates:
   - Email exists ✓
   - Code matches ✓
   - Code not expired (< 10 minutes) ✓
   - Code not already used ✓
   - Passwords match ✓
   - Password meets requirements ✓
5. If valid:
   - Update user's password (hashed)
   - Mark code as used
   - Send confirmation email
   - Redirect to login page
6. If invalid:
   - Show appropriate error message

---

## 📧 Email Templates

### Reset Code Email

**Subject:** Password Reset Code - AIU Hostel Cleaning

**Content:**
```
Hi {Name},

You recently requested to reset your password for your AIU Hostel Cleaning account.

Your password reset code is: 123456

This code will expire in 10 minutes.

If you did not request a password reset, please ignore this email or contact support.

Best regards,
AIU Hostel Cleaning Service Team
```

**Features:**
- Professional gradient header (purple/blue)
- Large, centered code display
- Expiration warning
- Security notice
- Responsive design

### Password Reset Confirmation Email

**Subject:** Password Reset Successful - AIU Hostel Cleaning

**Content:**
```
Hi {Name},

Your password has been reset successfully.

You can now log in to your AIU Hostel Cleaning account using your new password.

If you did not make this change, please contact support immediately.

Best regards,
AIU Hostel Cleaning Service Team
```

**Features:**
- Success confirmation
- "Log In Now" button
- Security alert
- Support contact information

---

## 🔒 Security Measures

1. **Code Expiration**
   - Codes expire after 10 minutes
   - Expired codes cannot be used

2. **One-Time Use**
   - Codes marked as used after successful reset
   - Used codes cannot be reused

3. **Code Invalidation**
   - Previous unused codes deleted when new code requested
   - Only one active code per user at a time

4. **Password Validation**
   - Minimum 8 characters
   - Must pass Django's password validators
   - Passwords must match confirmation

5. **Email Normalization**
   - Emails converted to lowercase
   - Whitespace trimmed
   - Prevents duplicate accounts with case variations

6. **Generic Error Messages**
   - For non-existent emails, return generic success message
   - Prevents email enumeration attacks

7. **Logging**
   - All password reset attempts logged
   - Failed attempts logged with details
   - Successful resets logged

---

## 🧪 Testing Guide

### Test Case 1: Request Reset Code

**Steps:**
1. Go to `/login`
2. Click "Forgot password?"
3. Enter valid email: `student1@aiu.edu.my`
4. Click "Send Reset Code"

**Expected:**
- ✅ Success message displayed
- ✅ Email received with 6-digit code
- ✅ Code saved in database with expiration time
- ✅ Link to reset password page shown

### Test Case 2: Reset Password with Valid Code

**Steps:**
1. Go to `/reset-password`
2. Enter email: `student1@aiu.edu.my`
3. Enter code from email: `123456`
4. Enter new password: `NewPassword123!`
5. Confirm password: `NewPassword123!`
6. Click "Reset Password"

**Expected:**
- ✅ Success message displayed
- ✅ Password updated in database (hashed)
- ✅ Code marked as used
- ✅ Confirmation email sent
- ✅ Auto-redirect to login after 3 seconds
- ✅ Can login with new password

### Test Case 3: Invalid Code

**Steps:**
1. Go to `/reset-password`
2. Enter email: `student1@aiu.edu.my`
3. Enter wrong code: `999999`
4. Enter new password
5. Click "Reset Password"

**Expected:**
- ❌ Error: "Invalid verification code."
- ❌ Password not changed

### Test Case 4: Expired Code

**Steps:**
1. Request reset code
2. Wait 11 minutes
3. Try to use the code

**Expected:**
- ❌ Error: "Verification code has expired. Please request a new one."
- ❌ Password not changed

### Test Case 5: Password Mismatch

**Steps:**
1. Go to `/reset-password`
2. Enter valid email and code
3. Enter password: `Password123!`
4. Confirm password: `DifferentPass123!`
5. Click "Reset Password"

**Expected:**
- ❌ Error: "Passwords do not match."
- ❌ Form not submitted

### Test Case 6: Non-existent Email

**Steps:**
1. Go to `/forgot-password`
2. Enter email: `nonexistent@example.com`
3. Click "Send Reset Code"

**Expected:**
- ✅ Generic success message (security)
- ✅ No email sent
- ✅ No code created

---

## 🛠️ API Reference

### 1. Request Password Reset

**Endpoint:** `POST /api/auth/forgot-password/`

**Request Body:**
```json
{
  "email": "user@aiu.edu.my"
}
```

**Success Response (200):**
```json
{
  "message": "A verification code has been sent to your email. Please check your inbox.",
  "email": "user@aiu.edu.my"
}
```

**Error Response (400):**
```json
{
  "email": ["No account found with this email address."]
}
```

**Error Response (500):**
```json
{
  "error": "Failed to send verification code. Please try again later."
}
```

### 2. Reset Password

**Endpoint:** `POST /api/auth/reset-password/`

**Request Body:**
```json
{
  "email": "user@aiu.edu.my",
  "code": "123456",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

**Success Response (200):**
```json
{
  "message": "Your password has been reset successfully. You can now log in with your new password."
}
```

**Error Response (400):**
```json
{
  "error": "Invalid verification code."
}
```

**Error Response (400):**
```json
{
  "error": "Verification code has expired. Please request a new one."
}
```

**Error Response (400):**
```json
{
  "confirm_password": ["Passwords do not match."]
}
```

---

## 📊 Database Schema

### PasswordResetCode Model

| Field | Type | Description |
|-------|------|-------------|
| id | AutoField | Primary key |
| user | ForeignKey(User) | User who requested reset |
| code | CharField(6) | 6-digit verification code |
| created_at | DateTimeField | When code was created |
| expires_at | DateTimeField | When code expires (created_at + 10 min) |
| is_used | BooleanField | Whether code has been used |

**Indexes:**
- user_id (ForeignKey index)
- created_at (for ordering)

**Methods:**
- `is_expired()` - Check if code expired
- `is_valid()` - Check if code is valid (not used and not expired)

---

## 🎨 UI Screenshots Description

### Forgot Password Page
- **Header:** Purple gradient background with "🔐 Forgot Password" title
- **Card:** White card with shadow
- **Input:** Email field with envelope icon
- **Button:** Gradient purple-to-blue "Send Reset Code" button
- **Success:** Green alert box with checkmark icon
- **Next Steps:** Blue info box with instructions
- **Links:** "Back to Login" and "Already have a code?"

### Reset Password Page
- **Header:** Purple gradient background with "🔒 Reset Password" title
- **Card:** White card with shadow
- **Inputs:**
  - Email field (envelope icon)
  - Code field (lock icon, centered, large font)
  - New password (key icon, show/hide toggle)
  - Confirm password (checkmark icon, show/hide toggle)
- **Button:** Gradient purple-to-blue "Reset Password" button
- **Success:** Green alert with auto-redirect notice
- **Links:** "Didn't receive a code?" and "Back to Login"

### Login Page Addition
- **Forgot Password Link:** Small link next to "Password" label

---

## 🚀 Deployment Checklist

### Backend
- [x] Model created and migrated
- [x] Serializers implemented
- [x] Views created with error handling
- [x] URLs configured
- [x] Email templates created (HTML + plain text)
- [x] Utility functions tested
- [x] Security measures implemented
- [x] Logging configured

### Frontend
- [x] ForgotPassword page created
- [x] ResetPassword page created
- [x] Routes added to App.js
- [x] API functions added
- [x] Login page updated
- [x] Form validation implemented
- [x] Error handling implemented
- [x] Success messages implemented
- [x] Auto-redirect configured

### Email Configuration
- [x] SMTP settings configured (Gmail)
- [x] Email templates formatted
- [x] Email sending tested
- [x] Fallback plain text included

---

## 🐛 Troubleshooting

### Issue: Email not received

**Solution:**
1. Check `.env` file has correct credentials:
   ```
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   ```
2. Verify Gmail App Password is valid
3. Check spam/junk folder
4. Check Django logs for email sending errors

### Issue: Code shows as expired immediately

**Solution:**
1. Check server timezone settings
2. Verify `expires_at` is set correctly (created_at + 10 minutes)
3. Check system time is accurate

### Issue: Frontend routes not working

**Solution:**
1. Verify routes added to `App.js`
2. Check component imports are correct
3. Clear browser cache
4. Restart development server

### Issue: Password validation failing

**Solution:**
1. Ensure password is at least 8 characters
2. Check Django password validators in settings
3. Verify password confirmation matches exactly

---

## 📝 Code Examples

### Generate and Send Reset Code (Backend)

```python
from api.utils.password_reset import create_reset_code, send_reset_code_email

# Create reset code for user
user = User.objects.get(email=email)
reset_code = create_reset_code(user)

# Send email
result = send_reset_code_email(user, reset_code.code)

if result['success']:
    print(f"Code sent to {user.email}")
```

### Request Reset Code (Frontend)

```javascript
import { authAPI } from '../../api/api';

const handleForgotPassword = async (email) => {
  try {
    const response = await authAPI.forgotPassword(email);
    console.log(response.data.message);
  } catch (error) {
    console.error(error.response.data.error);
  }
};
```

### Reset Password (Frontend)

```javascript
import { authAPI } from '../../api/api';

const handleResetPassword = async (data) => {
  try {
    const response = await authAPI.resetPassword({
      email: data.email,
      code: data.code,
      new_password: data.password,
      confirm_password: data.confirmPassword
    });
    console.log(response.data.message);
    navigate('/login');
  } catch (error) {
    console.error(error.response.data.error);
  }
};
```

---

## 🎉 Summary

### What Was Implemented

✅ **Backend (Django)**
- PasswordResetCode model with expiration
- forgot_password view (send OTP)
- reset_password view (verify OTP and reset)
- Professional HTML email templates
- Security measures (expiration, one-time use, validation)
- Comprehensive error handling and logging

✅ **Frontend (React)**
- ForgotPassword page with beautiful UI
- ResetPassword page with form validation
- API integration
- Success/error message handling
- Auto-redirect after success
- "Forgot password?" link on login page

✅ **Email System**
- Gmail SMTP configured
- Professional HTML templates
- Plain text fallback
- Reset code email
- Confirmation email

### Production Ready Features

1. **Security:** Codes expire, one-time use, password validation
2. **UX:** Clear messages, auto-redirect, validation feedback
3. **Design:** Professional gradient UI, responsive layout
4. **Error Handling:** Comprehensive error messages, logging
5. **Email:** Beautiful HTML templates, fallback text

---

## 📞 Support

For issues or questions:
- Email: support@aiu.edu.my
- Check Django logs: `python manage.py runserver`
- Check browser console for frontend errors

---

**System Status:** ✅ Fully Implemented and Tested

**Last Updated:** December 6, 2025
