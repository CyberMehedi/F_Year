# AIU Hostel Cleaning Service System

A comprehensive web-based management system for Albukhary International University's hostel cleaning services. This system streamlines the booking, assignment, and tracking of cleaning services across all hostel facilities.

## 🎯 Project Overview

This is a full-stack web application developed as a final year project for Albukhary International University. It provides an integrated platform for students to book cleaning services, cleaners to manage their tasks, and administrators to oversee the entire operation.

## ✨ Key Features

### For Students
- **Easy Booking**: Book cleaning services with just a few clicks
- **Service Options**: Choose between Standard Cleaning (RM20) or Deep Cleaning (RM30)
- **Flexible Scheduling**: Select preferred date and time slots
- **Real-time Tracking**: Monitor booking status from pending to completed
- **History**: View all past bookings and services
- **Notifications**: Get instant updates on booking status changes

### For Cleaners
- **Task Dashboard**: View all assigned tasks in one place
- **Daily Schedule**: See today's tasks organized by time
- **Issue Reporting**: Report maintenance issues discovered during cleaning
- **Performance Stats**: Track completed tasks and performance metrics
- **Status Updates**: Update task progress in real-time

### For Administrators
- **Centralized Management**: Oversee all bookings and operations
- **Staff Management**: Manage cleaner accounts and assignments
- **Task Assignment**: Assign cleaners to pending bookings
- **Maintenance Tracking**: Monitor and resolve reported issues
- **Analytics**: Generate reports and view system statistics

## 🏗️ Architecture

### Backend (Django + Django REST Framework)
- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (development)
- **CORS**: django-cors-headers

### Frontend (React)
- **Framework**: React 18.2
- **Routing**: React Router 6.20
- **Styling**: Tailwind CSS 3.3
- **HTTP Client**: Axios 1.6
- **State Management**: Context API

## 📋 Requirements

### Backend
- Python 3.8+
- Django 4.2.7
- Django REST Framework
- JWT Authentication

### Frontend
- Node.js 14+
- npm or yarn
- Modern web browser

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py create_admin

# Start development server
python manage.py runserver
```

Backend will run at `http://localhost:8000`

**Default Admin Credentials:**
- Email: admin@aiu.edu.my
- Password: admin123

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run at `http://localhost:3000`

## 📊 Data Models

### User
- Custom user model with role-based access
- Roles: ADMIN, CLEANER, STUDENT
- Email-based authentication

### Student Profile
- Student ID (format: AIU23102325)
- Block (format: 25E)
- Room Number (format: 25E-04-10)
- Contact information

### Cleaner Profile
- Staff ID
- Phone number
- Assigned blocks
- Active status

### Booking
- Booking type (Deep/Standard)
- Preferred date and time
- Status (Pending/Assigned/In Progress/Completed/Cancelled)
- Urgency level (Normal/Urgent)
- Room details
- Special instructions
- Assigned cleaner

### Issue/Maintenance Ticket
- Issue type (Plumbing/Electrical/Damage/Other)
- Description and photo
- Status (Open/In Progress/Resolved)
- Related booking
- Assigned staff

### Notification
- Title and message
- Read/Unread status
- Timestamp

## 🔐 Authentication & Authorization

### JWT Token-Based Authentication
- Access token lifetime: 1 day
- Refresh token lifetime: 7 days
- Automatic token refresh on expiry
- Secure storage in localStorage

### Role-Based Access Control
- **Students**: Can only access their own bookings and profile
- **Cleaners**: Can only see their assigned tasks
- **Admins**: Full access to all system features

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register/student/` - Register student
- `POST /api/auth/register/cleaner/` - Register cleaner
- `POST /api/auth/login/` - Login
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/token/refresh/` - Refresh token

### Bookings
- `GET /api/bookings/` - List bookings (role-filtered)
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/{id}/` - Get booking details
- `POST /api/bookings/{id}/assign_cleaner/` - Assign cleaner (admin)
- `POST /api/bookings/{id}/update_status/` - Update status
- `GET /api/bookings/my_bookings/` - Student's bookings
- `GET /api/bookings/history/` - Student's history

### Cleaner Tasks
- `GET /api/cleaner/tasks/new/` - New assigned tasks
- `GET /api/cleaner/tasks/today/` - Today's tasks
- `GET /api/cleaner/tasks/all/` - All tasks
- `GET /api/cleaner/history/` - Completed tasks
- `GET /api/cleaner/stats/` - Performance statistics

### Issues
- `GET /api/issues/` - List issues
- `POST /api/issues/` - Create issue
- `POST /api/issues/{id}/update_status/` - Update issue (admin)

### Admin
- `GET /api/admin/stats/` - Dashboard statistics
- `GET /api/admin/cleaners/` - List all cleaners
- `POST /api/admin/cleaners/{id}/toggle-status/` - Toggle cleaner status

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/{id}/mark_read/` - Mark as read
- `POST /api/notifications/mark_all_read/` - Mark all read
- `GET /api/notifications/unread_count/` - Unread count

## ⚙️ Business Rules

### Booking Validations
1. **Date Validation**: Cannot book services for past dates
2. **Time Slots**: 30-minute increments from 08:00 to 23:00
3. **Date-Time Check**: Combined date-time must be in the future
4. **Format Validations**:
   - Student ID: `AIU\d{8}` (e.g., AIU23102325)
   - Block: `\d{2}[A-Z]` (e.g., 25E)
   - Room: `\d{2}[A-Z]-\d{2}-\d{2}` (e.g., 25E-04-10)

### Service Types
- **Standard Cleaning** (RM20): Basic room cleaning, does NOT include bathroom
- **Deep Cleaning** (RM30): Comprehensive cleaning including bathroom

### Booking Status Flow
1. **Pending**: Newly created booking
2. **Assigned**: Cleaner has been assigned
3. **In Progress**: Cleaner is working on the task
4. **Completed**: Task finished successfully
5. **Cancelled**: Booking cancelled by student or admin

## 🎨 UI/UX Features

### Design Principles
- **Clean & Modern**: Professional university system appearance
- **Responsive**: Mobile-friendly design with collapsible sidebars
- **Intuitive**: Easy navigation with clear visual hierarchy
- **Accessible**: Proper color contrast and readable fonts

### Animations
- Smooth page transitions
- Fade-in effects for content
- Slide animations for modals and mobile menus
- Hover effects on interactive elements

### Color Scheme
- Primary: Blue shades (`primary-600`)
- Success: Green
- Warning: Yellow/Orange
- Danger: Red
- Neutral: Gray scale

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu, stacked layouts

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Manual Testing Steps
1. Register as a student
2. Book a cleaning service
3. Create admin account via Django admin
4. Login as admin and assign cleaner
5. Create cleaner account
6. Login as cleaner and view tasks
7. Update task status
8. Report an issue as cleaner
9. Resolve issue as admin

## 📦 Deployment

### Backend Deployment
1. Set `DEBUG=False` in settings.py
2. Configure production database
3. Set secure `SECRET_KEY`
4. Configure allowed hosts
5. Collect static files: `python manage.py collectstatic`
6. Set up WSGI server (Gunicorn, uWSGI)
7. Configure reverse proxy (Nginx, Apache)

### Frontend Deployment
1. Update API_BASE_URL in api.js
2. Build production bundle: `npm run build`
3. Deploy build folder to web server
4. Configure routing (all routes to index.html)

## 🔧 Configuration

### Backend Configuration
Edit `backend/hostel_cleaning/settings.py`:
- Database settings
- CORS allowed origins
- JWT token lifetime
- Time zone (default: Asia/Kuala_Lumpur)

### Frontend Configuration
Edit `frontend/src/api/api.js`:
- API base URL
- Request timeout
- Auth header configuration

## 📖 Project Structure

```
aiu-hostel-cleaning/
├── backend/
│   ├── hostel_cleaning/         # Django project
│   │   ├── settings.py          # Project settings
│   │   ├── urls.py              # Main URL config
│   │   └── wsgi.py              # WSGI config
│   ├── api/                     # Main app
│   │   ├── models.py            # Database models
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # API views
│   │   ├── urls.py              # API URLs
│   │   ├── permissions.py       # Custom permissions
│   │   ├── admin.py             # Admin configuration
│   │   └── management/          # Management commands
│   ├── requirements.txt         # Python dependencies
│   └── manage.py                # Django management
│
├── frontend/
│   ├── public/                  # Static files
│   ├── src/
│   │   ├── api/                 # API integration
│   │   ├── components/          # Reusable components
│   │   ├── context/             # React context
│   │   ├── pages/               # Page components
│   │   ├── App.js               # Main app component
│   │   ├── index.js             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json             # Node dependencies
│   └── tailwind.config.js       # Tailwind configuration
│
└── README.md                    # This file
```

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port
python manage.py runserver 8001
```

**Database migrations failed:**
```bash
# Reset migrations
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
```

**CORS errors:**
- Check CORS_ALLOWED_ORIGINS in settings.py
- Ensure frontend URL is included

### Frontend Issues

**API connection failed:**
- Verify backend is running
- Check API_BASE_URL in api.js
- Check browser console for errors

**Build failed:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Token expired:**
- Clear browser localStorage
- Login again

## 📚 Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [API Documentation](backend/README.md#api-endpoints)

## 🎓 Academic Information

**Institution**: Albukhary International University  
**Project Type**: Final Year Project  
**Year**: 2025  
**Purpose**: Modernize hostel cleaning service management

## 🤝 Support

For issues or questions:
1. Check documentation
2. Review error messages
3. Check backend/frontend logs
4. Verify configuration settings

## 📄 License

This project is developed for academic purposes at Albukhary International University.

## 🙏 Acknowledgments

- Albukhary International University
- Django and React communities
- All contributors and testers

---

**Happy Coding!** 🚀
# Hostel_Cleaning_System
# FYP
# FYP
# FYP
# FYP
# Hostel_Cleaning_System
