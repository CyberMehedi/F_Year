# AIU Hostel Cleaning Service System - Backend

This is the Django REST Framework backend for the Albukhary International University Hostel Cleaning Service System.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create admin user:**
   ```bash
   python manage.py create_admin
   ```
   This will create an admin user with:
   - Email: admin@aiu.edu.my
   - Password: admin123

6. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/student/` - Register student
- `POST /api/auth/register/cleaner/` - Register cleaner
- `POST /api/auth/login/` - Login
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Bookings
- `GET /api/bookings/` - List bookings (filtered by role)
- `POST /api/bookings/` - Create booking (students)
- `GET /api/bookings/{id}/` - Get booking details
- `PUT /api/bookings/{id}/` - Update booking
- `POST /api/bookings/{id}/assign_cleaner/` - Assign cleaner (admin)
- `POST /api/bookings/{id}/update_status/` - Update booking status
- `GET /api/bookings/my_bookings/` - Student's bookings
- `GET /api/bookings/history/` - Student's completed bookings

### Cleaner Tasks
- `GET /api/cleaner/tasks/new/` - New assigned tasks
- `GET /api/cleaner/tasks/today/` - Today's tasks
- `GET /api/cleaner/tasks/all/` - All tasks
- `GET /api/cleaner/history/` - Completed tasks
- `GET /api/cleaner/stats/` - Cleaner statistics

### Issues
- `GET /api/issues/` - List issues
- `POST /api/issues/` - Create issue (cleaners)
- `GET /api/issues/{id}/` - Get issue details
- `POST /api/issues/{id}/update_status/` - Update issue status (admin)

### Admin
- `GET /api/admin/stats/` - Dashboard statistics
- `GET /api/admin/cleaners/` - List all cleaners
- `POST /api/admin/cleaners/{id}/toggle-status/` - Toggle cleaner active status

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/{id}/mark_read/` - Mark as read
- `POST /api/notifications/mark_all_read/` - Mark all as read
- `GET /api/notifications/unread_count/` - Get unread count

### Profiles
- `GET /api/profile/student/` - Get student profile
- `PUT /api/profile/student/` - Update student profile
- `GET /api/profile/cleaner/` - Get cleaner profile
- `PUT /api/profile/cleaner/` - Update cleaner profile

## Data Models

### User
- Custom user model with roles: ADMIN, CLEANER, STUDENT
- Email-based authentication

### StudentProfile
- student_id (format: AIU23102325)
- block (format: 25E)
- room_number (format: 25E-04-10)
- phone

### CleanerProfile
- staff_id
- phone
- assigned_blocks
- is_active

### Booking
- booking_type (DEEP/STANDARD)
- preferred_date
- preferred_time (30-min slots from 08:00-23:00)
- urgency_level (NORMAL/URGENT)
- status (PENDING/ASSIGNED/IN_PROGRESS/COMPLETED/CANCELLED)
- block, room_number
- special_instructions
- assigned_cleaner

### Issue
- issue_type (PLUMBING/ELECTRICAL/DAMAGE/OTHER)
- description
- photo_url
- status (OPEN/IN_PROGRESS/RESOLVED)
- assigned_staff
- related booking

### Notification
- title
- message
- is_read
- user

## Notes

- JWT tokens are used for authentication
- Access token lifetime: 1 day
- Refresh token lifetime: 7 days
- CORS is enabled for http://localhost:3000
- Time zone is set to Asia/Kuala_Lumpur
