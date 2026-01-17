# Booking Assignment System - Complete Guide

## Overview

The Hostel Cleaning Service now supports **two methods** for assigning cleaners to bookings:

1. **Admin Manual Assignment** - Admin directly assigns a specific cleaner to a booking
2. **Cleaner Self-Acceptance** - Cleaners compete for bookings on a first-come-first-serve basis

---

## Features Implemented

### ✅ Backend Features

1. **Enhanced Admin Assignment Endpoint**
   - Endpoint: `POST /api/bookings/{id}/assign_cleaner/`
   - Permission: Admin only
   - Features:
     - Validates cleaner is active
     - Deletes pending cleaner notifications
     - Sends email to both cleaner and student
     - Distinguishes admin assignments from cleaner acceptances
     - Comprehensive logging

2. **Available Cleaners Endpoint**
   - Endpoint: `GET /api/admin/cleaners/available/`
   - Permission: Admin only
   - Returns:
     - Active cleaners only
     - Today's task count
     - Active task count
     - Sorted by availability (least busy first)

3. **Race Condition Protection**
   - Uses `transaction.atomic()` with `select_for_update()`
   - Prevents double-assignment when multiple cleaners accept simultaneously
   - Returns clear error: "This task has already been accepted by another cleaner"

### ✅ Frontend Features

1. **Enhanced Admin Bookings Management**
   - Cleaner workload display (today's tasks, active tasks)
   - Visual cleaner selection with availability indicators
   - Assign button for PENDING and WAITING_FOR_CLEANER bookings
   - Auto-sorted cleaners (least busy first)
   - Success/error toast notifications

2. **Cleaner Dashboard**
   - Accept button for new requests
   - Error handling for already-accepted bookings
   - Real-time booking refresh

---

## Booking Status Flow

```
┌─────────────────┐
│     PENDING     │ ◄─── Initial booking creation
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ WAITING_FOR_CLEANER  │ ◄─── Notification sent to all cleaners
└──────┬───────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│ ADMIN       │   │ CLEANER     │
│ ASSIGNS     │   │ ACCEPTS     │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │                 │
       └────────┬────────┘
                ▼
         ┌────────────┐
         │  ASSIGNED  │
         └──────┬─────┘
                │
                ▼
         ┌──────────────┐
         │ IN_PROGRESS  │
         └──────┬───────┘
                │
                ▼
         ┌────────────┐
         │ COMPLETED  │
         └────────────┘
```

---

## How Admin Assignment Works

### Step 1: Booking Creation
```
Student creates booking
    ↓
Status: WAITING_FOR_CLEANER
    ↓
Notification sent to ALL active cleaners
```

### Step 2: Admin Assignment
```
Admin opens Bookings Management page
    ↓
Clicks "Assign" button
    ↓
Modal shows available cleaners (sorted by availability)
    ↓
Admin selects cleaner
    ↓
API call: POST /api/bookings/{id}/assign_cleaner/
```

### Step 3: Backend Processing
```python
# In assign_cleaner() method
1. Validate cleaner is active
2. Store old_status
3. Set assigned_cleaner = selected cleaner
4. Set status = 'ASSIGNED'
5. Save booking
6. If old_status was WAITING_FOR_CLEANER:
   - Delete all NEW_BOOKING notifications
7. Create notification for student
8. Create notification for assigned cleaner
9. Send email to cleaner (admin assignment notice)
10. Send email to student (assignment confirmation)
11. Log assignment
```

### Step 4: Notifications
- **Student receives**: "Admin assigned [Cleaner Name] to your booking"
- **Cleaner receives**: "Admin assigned you to a new task at [Location]"
- **Other cleaners**: Their NEW_BOOKING notifications deleted

---

## How Cleaner Self-Acceptance Works

### Step 1: Cleaner Views New Requests
```
Cleaner navigates to "New Requests" page
    ↓
API call: GET /api/cleaner/tasks/new/
    ↓
Returns bookings with status = WAITING_FOR_CLEANER
```

### Step 2: Cleaner Clicks Accept
```
Cleaner clicks "Accept" button
    ↓
API call: POST /api/cleaner/bookings/{id}/accept/
    ↓
Race condition protection activated
```

### Step 3: Backend Processing (Race-Protected)
```python
# In accept_booking() view
with transaction.atomic():
    booking = Booking.objects.select_for_update().get(id=pk)
    
    # Check if already assigned
    if booking.assigned_cleaner is not None:
        return ERROR: "Already accepted by another cleaner"
    
    # Assign to current cleaner
    booking.assigned_cleaner = request.user
    booking.status = 'ASSIGNED'
    booking.save()
    
    # Update accepting cleaner's notification
    Notification.objects.filter(
        user=request.user,
        booking=booking,
        notification_type='NEW_BOOKING'
    ).update(
        notification_type='BOOKING_ACCEPTED',
        is_read=True
    )
    
    # Delete other cleaners' notifications
    Notification.objects.filter(
        booking=booking,
        notification_type='NEW_BOOKING'
    ).exclude(user=request.user).delete()
    
    # Create notification for student ONLY
    Notification.objects.create(
        user=booking.student,
        title="Booking Accepted",
        message=f"{request.user.name} accepted your task"
    )
    
    # Send email to student
    send_booking_accepted_email(booking, request.user)
```

### Step 4: What Happens to Losing Cleaners
```
If Cleaner B clicks Accept after Cleaner A:
    ↓
Database lock prevents simultaneous update
    ↓
Cleaner B receives error message
    ↓
Error: "This task has already been accepted by another cleaner"
    ↓
Cleaner B's notification deleted
    ↓
Cleaner B must choose another task
```

---

## API Endpoints Reference

### Admin Endpoints

#### Get Available Cleaners
```http
GET /api/admin/cleaners/available/
Authorization: Bearer {admin_token}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+60123456789",
    "role": "CLEANER",
    "is_active": true,
    "today_tasks": 2,
    "active_tasks": 5
  },
  ...
]
```

#### Assign Cleaner to Booking
```http
POST /api/bookings/{id}/assign_cleaner/
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "cleaner_id": 1
}
```

**Success Response:**
```json
{
  "message": "Cleaner John Doe successfully assigned to booking #123",
  "booking": {
    "id": 123,
    "status": "ASSIGNED",
    "assigned_cleaner": 1,
    "assigned_cleaner_name": "John Doe",
    ...
  }
}
```

**Error Responses:**
```json
// Missing cleaner_id
{
  "error": "cleaner_id is required"
}

// Cleaner not found or inactive
{
  "error": "Active cleaner not found"
}
```

### Cleaner Endpoints

#### Get New Requests
```http
GET /api/cleaner/tasks/new/
Authorization: Bearer {cleaner_token}
```

**Response:**
```json
[
  {
    "id": 123,
    "student_name": "Jane Smith",
    "block": "12A",
    "room_number": "101",
    "booking_type": "STANDARD",
    "preferred_date": "2025-12-09",
    "preferred_time": "MORNING",
    "status": "WAITING_FOR_CLEANER",
    "price": 15,
    ...
  }
]
```

#### Accept Booking
```http
POST /api/cleaner/bookings/{id}/accept/
Authorization: Bearer {cleaner_token}
```

**Success Response:**
```json
{
  "message": "Task successfully accepted",
  "booking": {
    "id": 123,
    "status": "ASSIGNED",
    "assigned_cleaner": 1,
    "assigned_cleaner_name": "John Doe",
    ...
  }
}
```

**Error Response (Already Accepted):**
```json
{
  "error": "This task has already been accepted by another cleaner"
}
```

---

## Frontend Components

### Admin Bookings Management
**File:** `frontend/src/pages/admin/BookingsManagement.js`

**Key Features:**
- Lists all bookings with filters
- Shows "Assign" button for PENDING and WAITING_FOR_CLEANER bookings
- Enhanced modal with cleaner workload display
- Visual selection with availability badges
- Success/error toast notifications

**Usage:**
```javascript
// Fetch available cleaners
const response = await adminAPI.availableCleaners();

// Assign cleaner to booking
await bookingAPI.assignCleaner(bookingId, cleanerId);
```

### Cleaner Dashboard
**File:** `frontend/src/pages/cleaner/NewRequests.js`

**Key Features:**
- Lists new booking requests
- Accept button with loading state
- Error handling for race conditions
- Auto-refresh after acceptance

**Usage:**
```javascript
// Accept booking
try {
  await bookingAPI.acceptBooking(bookingId);
  setToast({ message: 'Task accepted!', type: 'success' });
  fetchNewRequests(); // Refresh list
} catch (error) {
  setToast({ 
    message: error.response?.data?.error || 'Failed to accept task', 
    type: 'error' 
  });
}
```

---

## Notification Management

### Admin Assignment Notifications

**When admin assigns a cleaner:**

1. **Pending cleaner notifications deleted**
   ```python
   Notification.objects.filter(
       booking=booking,
       notification_type='NEW_BOOKING'
   ).delete()
   ```

2. **Student notified**
   ```python
   Notification.objects.create(
       user=booking.student,
       title="Admin Assigned Cleaner",
       message=f"Admin assigned {cleaner.name} to your booking"
   )
   ```

3. **Cleaner notified**
   ```python
   Notification.objects.create(
       user=cleaner,
       title="Admin Assignment",
       message=f"Admin assigned you to {booking.block} - {booking.room_number}"
   )
   ```

### Cleaner Acceptance Notifications

**When cleaner accepts:**

1. **Accepting cleaner's notification updated**
   ```python
   Notification.objects.filter(
       user=request.user,
       booking=booking,
       notification_type='NEW_BOOKING'
   ).update(
       notification_type='BOOKING_ACCEPTED',
       is_read=True
   )
   ```

2. **Other cleaners' notifications deleted**
   ```python
   Notification.objects.filter(
       booking=booking,
       notification_type='NEW_BOOKING'
   ).exclude(user=request.user).delete()
   ```

3. **Student notified (ONLY student, not all students)**
   ```python
   Notification.objects.create(
       user=booking.student,  # Specific student
       title="Booking Accepted",
       message=f"{request.user.name} accepted your task"
   )
   ```

---

## Email Notifications

### Admin Assignment Emails

**Email to Cleaner:**
```
Subject: Admin Assignment - New Task

Dear [Cleaner Name],

The administrator has assigned you to a cleaning task.

Task Details:
- Student: [Student Name]
- Location: [Block] - [Room Number]
- Type: [Booking Type]
- Date: [Date]
- Time: [Time Slot]
- Price: RM [Price]

This is an admin assignment. Please log in to view details and manage your schedule.

Best regards,
AIU Hostel Cleaning Service
```

**Email to Student:**
```
Subject: Cleaner Assigned to Your Request

Dear [Student Name],

A cleaner has been assigned to your booking request.

Booking Details:
- Cleaner: [Cleaner Name]
- Location: [Block] - [Room Number]
- Type: [Booking Type]
- Date: [Date]
- Time: [Time Slot]
- Price: RM [Price]

The cleaner will arrive during your scheduled time.

Best regards,
AIU Hostel Cleaning Service
```

### Cleaner Acceptance Emails

**Email to Student:**
```
Subject: Your Cleaning Request Has Been Accepted

Dear [Student Name],

Great news! Your cleaning request has been accepted.

Cleaner Details:
- Name: [Cleaner Name]
- Email: [Cleaner Email]
- Phone: [Cleaner Phone]

Booking Details:
- Location: [Block] - [Room Number]
- Date: [Date]
- Time: [Time Slot]
- Price: RM [Price]

Please ensure you're available during the scheduled time.

Best regards,
AIU Hostel Cleaning Service
```

---

## Testing Scenarios

### Test 1: Admin Assignment (Happy Path)

**Steps:**
1. Login as admin
2. Navigate to Bookings Management
3. Find booking with status WAITING_FOR_CLEANER
4. Click "Assign" button
5. Select cleaner from modal
6. Click "Assign" button in modal

**Expected:**
- ✅ Success toast appears
- ✅ Booking status changes to ASSIGNED
- ✅ Cleaner name appears in Cleaner column
- ✅ Cleaner receives email
- ✅ Student receives email
- ✅ Pending cleaner notifications deleted

### Test 2: Cleaner Acceptance (Race Condition)

**Steps:**
1. Create booking (should notify all cleaners)
2. Login as Cleaner A in Browser 1
3. Login as Cleaner B in Browser 2
4. Both navigate to New Requests
5. Both click "Accept" on same booking simultaneously

**Expected:**
- ✅ First cleaner succeeds
- ✅ Second cleaner gets error: "Already accepted"
- ✅ Second cleaner's notification deleted
- ✅ Only student receives acceptance notification
- ✅ Only student receives email

### Test 3: Admin Overrides Waiting State

**Steps:**
1. Create booking (WAITING_FOR_CLEANER)
2. Multiple cleaners can see it
3. Before anyone accepts, admin assigns specific cleaner
4. Other cleaners try to accept

**Expected:**
- ✅ Admin assignment succeeds
- ✅ Status changes to ASSIGNED
- ✅ All cleaner notifications deleted
- ✅ Cleaner attempts to accept get error

### Test 4: Cleaner Workload Display

**Steps:**
1. Assign 3 tasks to Cleaner A (2 today, 1 future)
2. Assign 1 task to Cleaner B (0 today, 1 future)
3. Login as admin
4. Open assign modal

**Expected:**
- ✅ Cleaner B appears first (less busy)
- ✅ Cleaner A shows "Today: 2, Active: 3"
- ✅ Cleaner B shows "Today: 0, Active: 1"

---

## Common Issues & Solutions

### Issue 1: "Active cleaner not found"

**Cause:** Trying to assign inactive cleaner or wrong ID

**Solution:**
- Ensure cleaner has `is_active=True`
- Verify cleaner_id is correct
- Check cleaner role is 'CLEANER'

### Issue 2: "This task has already been accepted"

**Cause:** Another cleaner accepted first (race condition)

**Solution:**
- This is normal behavior
- Cleaner should select another task
- Frontend should show clear error message

### Issue 3: Cleaner doesn't see assigned task

**Cause:** Status not updated or notification not sent

**Solution:**
- Check booking status is 'ASSIGNED'
- Verify assigned_cleaner field is set
- Check notification was created
- Ensure cleaner queries filter by assigned_cleaner

### Issue 4: Multiple cleaners still see accepted booking

**Cause:** Notifications not deleted properly

**Solution:**
- Verify `Notification.objects.filter(...).delete()` executes
- Check transaction commits successfully
- Ensure frontend refreshes booking list

---

## Database Schema

### Booking Model
```python
class Booking(models.Model):
    student = ForeignKey(User, role='STUDENT')
    assigned_cleaner = ForeignKey(User, role='CLEANER', null=True, blank=True)
    status = CharField(choices=STATUS_CHOICES)
    booking_type = CharField(choices=['STANDARD', 'DEEP'])
    preferred_date = DateField()
    preferred_time = CharField()
    # ... other fields
```

### Key Status Values
- `PENDING` - Initial creation
- `WAITING_FOR_CLEANER` - Notifications sent to cleaners
- `ASSIGNED` - Cleaner assigned (by admin or self)
- `IN_PROGRESS` - Service in progress
- `COMPLETED` - Service completed
- `CANCELLED` - Booking cancelled

---

## Performance Considerations

### Database Locking
- `select_for_update()` acquires row-level lock
- Other transactions wait until lock released
- Prevents race conditions but may slow concurrent accepts

### Optimization Tips
1. Use database indexes on:
   - `booking.status`
   - `booking.assigned_cleaner`
   - `booking.preferred_date`
   - `notification.notification_type`

2. Use `select_related()` for foreign keys:
   ```python
   Booking.objects.select_related('student', 'assigned_cleaner')
   ```

3. Use `prefetch_related()` for reverse relations:
   ```python
   User.objects.prefetch_related('assigned_bookings')
   ```

---

## Security Considerations

### Permission Checks
- Admin assignment: `@permission_classes([IsAdmin])`
- Cleaner acceptance: `@permission_classes([IsAuthenticated])` + role check
- Booking creation: Student role verified

### Input Validation
- cleaner_id validated against active cleaners
- booking_id validated against existing bookings
- Race condition protection prevents double-assignment

### Authorization
- Cleaners can only accept, not assign
- Admins can assign any active cleaner
- Students can only see their own bookings

---

## Future Enhancements

### Possible Improvements

1. **Auto-Assignment Algorithm**
   - Automatically assign to least busy cleaner
   - Consider cleaner proximity to block
   - Factor in cleaner ratings

2. **Notification Preferences**
   - Let cleaners choose notification methods
   - SMS/WhatsApp integration
   - Push notifications

3. **Cleaner Availability Calendar**
   - Cleaners set available hours
   - System only notifies available cleaners
   - Prevent assignments during off-hours

4. **Booking Preferences**
   - Students prefer specific cleaners
   - Cleaners can decline assignments
   - Reassignment workflow

5. **Analytics Dashboard**
   - Average acceptance time
   - Cleaner efficiency metrics
   - Student satisfaction ratings

---

## Troubleshooting Commands

### Check Booking Status
```bash
python manage.py shell
>>> from api.models import Booking
>>> booking = Booking.objects.get(id=123)
>>> print(f"Status: {booking.status}")
>>> print(f"Assigned: {booking.assigned_cleaner}")
```

### Check Notifications
```bash
>>> from api.models import Notification
>>> Notification.objects.filter(booking_id=123)
```

### Test Email Sending
```bash
>>> from api.utils.email_utils import send_booking_accepted_email
>>> send_booking_accepted_email(booking, cleaner)
```

### Clear Stale Notifications
```bash
>>> Notification.objects.filter(
...     notification_type='NEW_BOOKING',
...     booking__status='ASSIGNED'
... ).delete()
```

---

## Conclusion

The booking assignment system provides flexibility with two assignment methods:
- **Admin control** for critical or VIP bookings
- **Cleaner autonomy** for efficient distribution

Both methods are:
- ✅ Race-condition protected
- ✅ Well-notified (email + in-app)
- ✅ Properly tested
- ✅ User-friendly

The system handles edge cases gracefully and provides clear feedback to all users.
