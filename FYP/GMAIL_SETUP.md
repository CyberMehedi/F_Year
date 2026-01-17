# Gmail Email Setup Instructions

## Step 1: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
   - Click "2-Step Verification"
   - Follow the steps to set it up
4. Go back to Security page
5. Search for "App passwords" or scroll down to find it
6. Click **App passwords**
7. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or Other)
8. Click **Generate**
9. Copy the 16-character password (it will look like: abcd efgh ijkl mnop)

## Step 2: Update .env File

1. Open the file: `backend/.env`
2. Replace the placeholder values:
   ```
   EMAIL_HOST_USER=your-actual-email@gmail.com
   EMAIL_HOST_PASSWORD=abcdefghijklmnop
   ```
   (Remove spaces from the app password)

3. Save the file

## Step 3: Restart Django Server

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again:
   ```
   cd backend
   python manage.py runserver
   ```

## Step 4: Test Email

1. Register a new account on your website
2. Check your real email inbox
3. You should receive the welcome email!

## Troubleshooting

**Problem: "Username and Password not accepted"**
- Make sure you're using an App Password, NOT your regular Gmail password
- Make sure 2-Step Verification is enabled
- Remove any spaces from the app password

**Problem: "SMTPAuthenticationError"**
- Double-check the email address is correct
- Regenerate the app password and try again

**Problem: Email not received**
- Check your spam/junk folder
- Make sure Less Secure App Access is NOT required (App Passwords work with 2FA)
- Wait a few minutes, sometimes there's a delay

**Problem: "Connection refused"**
- Check if your firewall is blocking port 587
- Try using port 465 with EMAIL_USE_SSL = True instead of EMAIL_USE_TLS

## Example .env File

```
EMAIL_HOST_USER=mehedi.hasan@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
```

## Security Note

⚠️ **NEVER commit the .env file to Git!**

The `.env` file is already in `.gitignore`. Keep your email password secret!
