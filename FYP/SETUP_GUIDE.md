# AIU Hostel Cleaning Service - Setup Guide

This guide will walk you through setting up the complete project from scratch.

## Prerequisites

Ensure you have the following installed:
- Python 3.8 or higher
- Node.js 14.x or higher
- pip (Python package manager)
- npm or yarn (Node package manager)
- Git (optional, for version control)

## Step-by-Step Setup

### Phase 1: Backend Setup (Django)

#### 1.1 Navigate to Backend Directory
```bash
cd backend
```

#### 1.2 Create Virtual Environment
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

#### 1.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- Django 4.2.7
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- Pillow
- python-decouple

#### 1.4 Create Database Tables
```bash
python manage.py makemigrations
python manage.py migrate
```

You should see migrations being applied for:
- auth
- contenttypes
- sessions
- api (our custom app)

#### 1.5 Create Admin User
```bash
python manage.py create_admin
```

This creates an admin account with:
- Email: admin@aiu.edu.my
- Password: admin123

**⚠️ Important**: Change this password in production!

#### 1.6 Start Backend Server
```bash
python manage.py runserver
```

The backend should now be running at `http://localhost:8000`

You should see output like:
```
Django version 4.2.7, using settings 'hostel_cleaning.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

#### 1.7 Verify Backend is Working

Open a browser and visit:
- `http://localhost:8000/admin` - Django admin (login with admin credentials)
- `http://localhost:8000/api/` - Should show Django REST Framework browsable API

Keep this terminal window open to keep the backend running.

---

### Phase 2: Frontend Setup (React)

#### 2.1 Open New Terminal Window
Keep the backend running, open a new terminal window for frontend.

#### 2.2 Navigate to Frontend Directory
```bash
cd frontend
```

#### 2.3 Install Node Dependencies
```bash
npm install
```

This will install:
- React and React DOM
- React Router
- Axios
- Tailwind CSS
- All other dependencies

This may take 2-5 minutes depending on your internet speed.

#### 2.4 Start Frontend Development Server
```bash
npm start
```

The frontend should automatically open in your browser at `http://localhost:3000`

If it doesn't open automatically, manually visit `http://localhost:3000`

You should see the AIU Hostel Cleaning Service homepage.

---

### Phase 3: Verify Everything Works

#### 3.1 Test Backend Connection
1. Open browser developer console (F12)
2. Navigate to Network tab
3. Interact with the website
4. Check that API calls to `http://localhost:8000` are successful

#### 3.2 Test Registration
1. Click "Register" in the navigation
2. Select "Student" role
3. Fill in the form with test data:
   - Name: Test Student
   - Email: student@aiu.edu.my
   - Password: test123456
   - Confirm Password: test123456
   - Student ID: AIU12345678
   - Block: 25E
   - Room Number: 25E-04-10
   - Phone: +60123456789 (optional)
4. Click "Create Account"

If successful, you'll be redirected to the student dashboard.

#### 3.3 Test Login
1. Logout (if logged in)
2. Click "Log In"
3. Select role (Student/Cleaner/Admin)
4. Enter credentials
5. Click "Sign In"

#### 3.4 Test Booking (as Student)
1. Login as a student
2. Click "Book Service" or go to Dashboard > Book Service
3. Select service type (Standard or Deep Cleaning)
4. Choose a future date
5. Select a time slot
6. Fill in room details
7. Add special instructions (optional)
8. Click "Confirm Booking"

---

## Testing Different Roles

### Test as Admin
1. Login at `http://localhost:3000/login`
2. Select "Admin" role
3. Email: admin@aiu.edu.my
4. Password: admin123

### Create Cleaner Account

**Option 1: Through Frontend**
1. Go to `http://localhost:3000/register`
2. Select "Cleaner"
3. Fill in the form
4. Register

**Option 2: Through Django Admin**
1. Visit `http://localhost:8000/admin`
2. Login with admin credentials
3. Go to Users > Add User
4. Fill in details and select role "CLEANER"
5. Save

---

## Troubleshooting

### Backend Issues

#### Issue: "Port is already in use"
**Solution:**
```bash
# Windows - Find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Or run on different port
python manage.py runserver 8001
```

#### Issue: "Module not found"
**Solution:**
```bash
# Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt
```

#### Issue: "Database is locked"
**Solution:**
```bash
# Stop the server (Ctrl+C)
# Delete database and recreate
rm db.sqlite3
python manage.py migrate
python manage.py create_admin
```

### Frontend Issues

#### Issue: "npm command not found"
**Solution:**
Install Node.js from https://nodejs.org/

#### Issue: "Port 3000 is already in use"
**Solution:**
The terminal will ask if you want to use a different port. Type `Y` and press Enter.

Or manually use different port:
```bash
# Windows
set PORT=3001 && npm start

# macOS/Linux
PORT=3001 npm start
```

#### Issue: "Cannot connect to backend API"
**Solution:**
1. Verify backend is running at `http://localhost:8000`
2. Check CORS settings in `backend/hostel_cleaning/settings.py`
3. Ensure `http://localhost:3000` is in CORS_ALLOWED_ORIGINS

#### Issue: "Module build failed"
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Common Errors

#### Issue: "CSRF token missing"
**Solution:**
This shouldn't happen with JWT auth. If it does, ensure you're using the correct API endpoints and tokens are being sent in headers.

#### Issue: "401 Unauthorized"
**Solution:**
1. Token might be expired - logout and login again
2. Check that Authorization header is being sent
3. Verify token is stored in localStorage

#### Issue: "Validation error: [field] is required"
**Solution:**
Ensure all required fields in forms are filled correctly with proper format.

---

## Data Format Reference

### Student ID Format
- Pattern: `AIU` + 8 digits
- Example: `AIU23102325`
- Regex: `^AIU\d{8}$`

### Block Format
- Pattern: 2 digits + 1 uppercase letter
- Example: `25E`
- Regex: `^\d{2}[A-Z]$`

### Room Number Format
- Pattern: 2 digits + 1 letter + dash + 2 digits + dash + 2 digits
- Example: `25E-04-10`
- Regex: `^\d{2}[A-Z]-\d{2}-\d{2}$`

### Time Slots
- Available: 08:00 to 23:00
- Increment: 30 minutes
- Examples: 08:00, 08:30, 09:00, ..., 23:00

---

## Next Steps

### 1. Explore the System
- Register as different users
- Create bookings
- Assign cleaners (as admin)
- Report issues (as cleaner)

### 2. Customize the System
- Update university branding
- Modify color scheme in Tailwind config
- Add more service types
- Extend booking features

### 3. Complete Remaining Pages
Some pages are placeholders. Implement them following the pattern of existing pages:
- Student: MyBookings, History, Profile, Notifications
- Cleaner: All dashboard pages
- Admin: All dashboard pages

### 4. Add More Features
- Email notifications
- Payment integration
- Rating system
- Recurring bookings
- Mobile app

---

## Development Workflow

### Making Changes to Backend
1. Modify models in `api/models.py`
2. Create migrations: `python manage.py makemigrations`
3. Apply migrations: `python manage.py migrate`
4. Update serializers in `api/serializers.py`
5. Update views in `api/views.py`
6. Test with Django REST Framework browsable API

### Making Changes to Frontend
1. Modify components in `src/components/` or `src/pages/`
2. Changes auto-reload in browser (Hot Module Replacement)
3. Check browser console for errors
4. Test responsiveness with browser dev tools

### Git Workflow (Recommended)
```bash
# Initialize git repository
git init

# Create .gitignore (already provided)
# Add files
git add .

# Commit changes
git commit -m "Initial commit"

# Create repository on GitHub
# Add remote and push
git remote add origin <your-repo-url>
git push -u origin main
```

---

## Production Deployment Checklist

### Backend
- [ ] Set `DEBUG = False` in settings.py
- [ ] Change SECRET_KEY to a strong random value
- [ ] Configure production database (PostgreSQL)
- [ ] Set up proper ALLOWED_HOSTS
- [ ] Configure static file serving
- [ ] Set up HTTPS
- [ ] Use environment variables for sensitive data
- [ ] Set up proper logging
- [ ] Configure email backend for notifications

### Frontend
- [ ] Update API_BASE_URL to production URL
- [ ] Build production bundle: `npm run build`
- [ ] Configure web server (Nginx/Apache)
- [ ] Set up SSL certificate
- [ ] Configure caching headers
- [ ] Set up CDN (optional)

---

## Support & Resources

### Documentation
- Django: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/

### Project Files
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- Main README: `README.md`

---

## Success Indicators

You know the setup is successful when:
- ✅ Backend runs without errors at `http://localhost:8000`
- ✅ Frontend loads at `http://localhost:3000`
- ✅ You can register a new student account
- ✅ You can login with different roles
- ✅ You can create a booking as a student
- ✅ You can access Django admin panel
- ✅ API calls in browser Network tab show 200 status

---

**Congratulations!** Your AIU Hostel Cleaning Service System is now set up and ready for development! 🎉
