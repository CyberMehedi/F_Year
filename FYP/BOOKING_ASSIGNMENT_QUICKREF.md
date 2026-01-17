# Booking Assignment - Quick Reference Card

## 🚀 Quick Start

### Servers
```bash
# Backend (Terminal 1)
cd backend
python manage.py runserver

# Frontend (Terminal 2)
cd frontend
npm start
```

**Access:** http://localhost:3000

---

## 🔑 Key Endpoints

### Admin Endpoints
```
GET  /api/admin/cleaners/available/          # Get cleaners with workload
POST /api/bookings/{id}/assign_cleaner/      # Assign cleaner to booking
     Body: { "cleaner_id": 1 }
```

### Cleaner Endpoints
```
GET  /api/cleaner/tasks/new/                 # Get new booking requests
POST /api/cleaner/bookings/{id}/accept/      # Accept booking
```

### Booking Endpoints
```
GET  /api/bookings/                          # List all bookings (filtered by role)
POST /api/bookings/{id}/update_status/       # Update booking status
     Body: { "status": "IN_PROGRESS" }
```

---

## 📊 Booking Status Values

```
PENDING              → Initial creation
WAITING_FOR_CLEANER  → Notifications sent
ASSIGNED             → Cleaner assigned
IN_PROGRESS          → Service started
COMPLETED            → Service finished
CANCELLED            → Booking cancelled
```

---

## 🎯 Assignment Methods

### Method 1: Admin Assignment
**Who:** Admin only
**How:** Bookings Management → Assign button → Select cleaner
**When:** Manual control needed
**Result:** Status = ASSIGNED, Notifications deleted, Emails sent

### Method 2: Cleaner Acceptance
**Who:** Any cleaner
**How:** New Requests → Accept button
**When:** First-come-first-serve
**Result:** Status = ASSIGNED, Race protection active, Student notified

---

## 🔒 Race Condition Protection

```python
with transaction.atomic():
    booking = Booking.objects.select_for_update().get(id=pk)
    if booking.assigned_cleaner is not None:
        return ERROR
    booking.assigned_cleaner = cleaner
    booking.save()
```

**Result:** Only ONE cleaner succeeds, others get error

---

## 📧 Email Triggers

| Action | Recipient | Subject |
|--------|-----------|---------|
| Admin assigns | Cleaner | "Admin Assignment - New Task" |
| Admin assigns | Student | "Cleaner Assigned to Your Request" |
| Cleaner accepts | Student | "Your Cleaning Request Has Been Accepted" |

---

## 🎨 UI Features

### Admin Modal
- ✅ Cleaner cards with photos
- ✅ Workload badges (Today: X, Active: Y)
- ✅ Sorted by availability
- ✅ Click to select
- ✅ Visual feedback

### Cleaner Dashboard
- ✅ New Requests page
- ✅ Accept button
- ✅ Error handling
- ✅ Loading states

---

## 🧪 Quick Tests

### Test 1: Admin Assignment (2 min)
1. Login as admin → Bookings Management
2. Find WAITING_FOR_CLEANER booking
3. Click Assign → Select cleaner → Assign
4. ✅ Status = ASSIGNED, Toast appears

### Test 2: Cleaner Acceptance (2 min)
1. Login as student → Create booking
2. Login as cleaner → New Requests
3. Click Accept on booking
4. ✅ Success message, Booking in All Tasks

### Test 3: Race Condition (3 min)
1. Create booking
2. Two cleaners in different browsers
3. Both click Accept simultaneously
4. ✅ One succeeds, one gets error

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Active cleaner not found" | Check `is_active=True` and role='CLEANER' |
| "Already accepted" | Expected - another cleaner was faster |
| Emails not sending | Check `.env` email config |
| Modal not showing cleaners | Check API response in dev tools |

---

## 📁 Key Files

### Backend
```
backend/api/views.py           # Main logic
backend/api/urls.py            # Routes
backend/api/models.py          # Database models
backend/api/serializers.py     # API serializers
```

### Frontend
```
frontend/src/api/api.js                           # API calls
frontend/src/pages/admin/BookingsManagement.js    # Admin UI
frontend/src/pages/cleaner/NewRequests.js         # Cleaner UI
```

### Documentation
```
BOOKING_ASSIGNMENT_GUIDE.md       # Complete guide
BOOKING_ASSIGNMENT_TESTING.md     # Testing guide
BOOKING_ASSIGNMENT_SUMMARY.md     # Implementation summary
```

---

## 🔍 Debugging

### Check Booking Status
```python
python manage.py shell
>>> from api.models import Booking
>>> booking = Booking.objects.get(id=123)
>>> print(booking.status, booking.assigned_cleaner)
```

### Check Notifications
```python
>>> from api.models import Notification
>>> Notification.objects.filter(booking_id=123)
```

### Check Email Logs
```bash
# Django console output
# Look for "Email sent to ..."
```

---

## 📱 User Roles

| Role | Can Do |
|------|--------|
| **Admin** | Assign any cleaner, View all bookings, Update statuses |
| **Cleaner** | Accept new requests, View assigned tasks, Update task status |
| **Student** | Create bookings, View own bookings, Cancel bookings |

---

## 🎯 Decision Flow

```
New Booking Created
        ↓
   Is urgent/VIP?
        ↓
    ┌───┴───┐
   YES     NO
    ↓       ↓
  Admin   Cleaner
  Assigns Accepts
    ↓       ↓
    └───┬───┘
        ↓
    ASSIGNED
```

---

## 📊 Cleaner Workload

**Display Format:**
```
Today: X tasks    (today's assigned tasks)
Active: Y tasks   (all non-completed tasks)
```

**Sorting:**
Least busy first (by active_tasks count)

---

## ✅ Success Indicators

**Admin Assignment:**
- ✅ Green toast: "Cleaner assigned successfully"
- ✅ Booking status updates to ASSIGNED
- ✅ Cleaner name appears in table
- ✅ Both receive emails

**Cleaner Acceptance:**
- ✅ Success message appears
- ✅ Booking disappears from New Requests
- ✅ Booking appears in All Tasks
- ✅ Student receives email

**Race Condition:**
- ✅ First cleaner: Success
- ✅ Second cleaner: Error "Already accepted"
- ✅ No duplicate assignments

---

## 🚨 Error Messages

```
"cleaner_id is required"
→ Missing cleaner_id in request

"Active cleaner not found"
→ Cleaner inactive or doesn't exist

"This task has already been accepted by another cleaner"
→ Race condition - someone else was faster

"You don't have permission"
→ Wrong role for this action
```

---

## 🔄 Status Transitions

```
PENDING → WAITING_FOR_CLEANER
   ↓
WAITING_FOR_CLEANER → ASSIGNED (admin or cleaner)
   ↓
ASSIGNED → IN_PROGRESS (cleaner)
   ↓
IN_PROGRESS → COMPLETED (cleaner or admin)
```

**Cancellation:** Any status → CANCELLED (admin or student)

---

## 💾 Database Tables

```
Booking
  - id
  - student_id (FK)
  - assigned_cleaner_id (FK, nullable)
  - status
  - booking_type
  - preferred_date
  - preferred_time

Notification
  - id
  - user_id (FK)
  - booking_id (FK, nullable)
  - notification_type
  - is_read
```

---

## 🎓 Best Practices

1. **Always check is_active** before assigning
2. **Use transaction.atomic()** for critical operations
3. **Delete old notifications** when status changes
4. **Send emails** for all assignments
5. **Show loading states** in UI
6. **Handle errors gracefully** with clear messages
7. **Log important actions** for debugging
8. **Test race conditions** thoroughly

---

## 📞 Quick Help

**Question:** Can admin reassign a booking?
**Answer:** Yes, admin can assign even if already assigned.

**Question:** Can cleaner decline?
**Answer:** Cleaner acceptance is voluntary. Admin assignment is not.

**Question:** What if cleaner is busy?
**Answer:** Admin sees workload, can choose less busy cleaner.

**Question:** How fast is race protection?
**Answer:** Instant - database lock prevents conflicts.

---

## 🎉 Success Criteria

- [x] Admin can assign cleaners
- [x] Cleaners can accept bookings
- [x] Race conditions prevented
- [x] Notifications managed properly
- [x] Emails sent correctly
- [x] UI responsive and clear
- [x] Errors handled gracefully
- [x] Documentation complete

---

## 📚 Resources

- **Complete Guide:** `BOOKING_ASSIGNMENT_GUIDE.md`
- **Testing Guide:** `BOOKING_ASSIGNMENT_TESTING.md`
- **Implementation Summary:** `BOOKING_ASSIGNMENT_SUMMARY.md`
- **This Quick Ref:** `BOOKING_ASSIGNMENT_QUICKREF.md`

---

**Print this card and keep it handy! 📌**

*Last Updated: December 8, 2025*
