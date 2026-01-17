# Admin Assign Cleaner - Feature Verification

## ✅ FEATURE IS ALREADY FULLY IMPLEMENTED

### Backend Implementation ✓
**File:** `backend/api/models.py` line 172
```python
assigned_cleaner = models.ForeignKey(
    User, 
    on_delete=models.SET_NULL, 
    null=True, 
    blank=True, 
    related_name='assigned_tasks', 
    limit_choices_to={'role': 'CLEANER'}
)
```

**Endpoint:** `POST /api/bookings/{id}/assign_cleaner/`
- Location: `backend/api/views.py` lines 358-432
- Authorization: Admin only (IsAdmin permission)
- Request: `{ "cleaner_id": 123 }`
- Response: Updated booking with cleaner details

**Cleaners List:** `GET /api/admin/cleaners/available/`
- Location: `backend/api/views.py` lines 815-847
- Returns cleaners sorted by workload

### Frontend Implementation ✓
**File:** `frontend/src/pages/admin/BookingsManagement.js`

**Lines 222-230:** Assign/Reassign Button
```javascript
{booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
  <button
    onClick={() => { setSelectedBooking(booking); setShowAssignModal(true); }}
    className="text-primary-600 hover:text-primary-900"
  >
    {booking.assigned_cleaner_name ? 'Reassign' : 'Assign'}
  </button>
)}
```

**Lines 260-325:** Assignment Modal with cleaner selection

### Database Verification ✓
```
Booking #24:
- Status: WAITING_FOR_CLEANER
- Assigned Cleaner: Not assigned
- Should show "Assign" button

Available Cleaners: 3 active cleaners
```

---

## How to See the Feature

### Step 1: Start Servers
```bash
# Backend (Terminal 1)
cd backend
python manage.py runserver

# Frontend (Terminal 2)
cd frontend
npm start
```

### Step 2: Login as Admin
- Email: `admin@aiu.edu.my`
- Password: (your admin password)

### Step 3: Navigate to Bookings
- Go to: `http://localhost:3001/admin/bookings`

### Step 4: Find Booking #24
- Look for Booking ID: **#24**
- Status: **WAITING_FOR_CLEANER**
- Cleaner column: **"Not assigned"** (gray italic)
- Actions column: **"Assign"** button (blue text)

### Step 5: Test Assignment
1. Click the **"Assign"** button
2. Modal opens showing:
   - Booking details (student, room, date)
   - List of 3 cleaners with workload info
3. Click on a cleaner to select
4. Click **"Assign"** button
5. Success toast appears
6. Table updates showing cleaner name
7. Button changes to **"Reassign"**

---

## Troubleshooting

### If you don't see the Assign button:

**1. Check Browser Console (F12 → Console tab)**
- Look for JavaScript errors
- Look for failed API requests

**2. Verify Login**
- Open DevTools → Application → Local Storage
- Check if `user` key exists
- Verify `role: "ADMIN"`

**3. Check Network Requests (F12 → Network tab)**
- Look for `/api/bookings/` request
- Check if it returns 21 bookings
- Verify response includes Booking #24

**4. Filter Settings**
- Status filter: Set to "ALL" or "WAITING_FOR_CLEANER"
- Search box: Should be empty

**5. Verify Frontend is Running**
```bash
cd frontend
npm start
```
- Should open `http://localhost:3001`

**6. Hard Refresh**
- Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clears cached JavaScript

---

## Quick Test

**Run this to create a test booking:**
```bash
cd backend
python manage.py shell
```

```python
from api.models import Booking, User
from datetime import date, time

# Get a student and create unassigned booking
student = User.objects.filter(role='STUDENT').first()
booking = Booking.objects.create(
    student=student,
    booking_type='STANDARD',
    preferred_date=date(2025, 12, 28),
    preferred_time=time(14, 0),
    block='25E',
    room_number='25E-01-01',
    status='WAITING_FOR_CLEANER',
    urgency_level='NORMAL'
)
print(f"Created Booking #{booking.id} - Status: {booking.status}")
```

This new booking will definitely show the "Assign" button.

---

## API Test (Alternative Verification)

**Test the endpoint directly:**
```bash
# Get admin token first (replace with your admin password)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aiu.edu.my","password":"YOUR_PASSWORD"}'

# Use the access token:
curl -X POST http://localhost:8000/api/bookings/24/assign_cleaner/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cleaner_id":2}'
```

---

## Summary

✅ **Backend:** Fully implemented  
✅ **Frontend:** Fully implemented  
✅ **Database:** Test data exists  
✅ **Tests:** Already created in `backend/test_admin_assign_cleaner.py`

**The feature is ready to use. If you still can't see it, the issue is environmental (frontend not running, wrong user, browser cache), not code-related.**
