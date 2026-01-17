# Admin Assign Cleaner - Quick Reference

## What Was Added
Admin can now **assign and reassign** cleaners to any active booking (not just new ones).

## Files Changed
1. ✅ `frontend/src/pages/admin/BookingsManagement.js` - Extended assign button, added reassign UI
2. ✅ `backend/test_admin_assign_cleaner.py` - 8 test cases

## What Was NOT Changed
- ❌ Database schema (used existing field)
- ❌ Backend endpoints (used existing endpoints)
- ❌ Payment/receipt logic
- ❌ Cleaner app
- ❌ Routing

## How to Use

### Assign Cleaner
1. Go to `/admin/bookings`
2. Find booking with "WAITING_FOR_CLEANER" or "PENDING" status
3. Click "Assign" button
4. Select cleaner from modal
5. Click "Assign"

### Reassign Cleaner
1. Find booking with assigned cleaner (status: ASSIGNED or IN_PROGRESS)
2. Click "Reassign" button
3. Modal shows current cleaner
4. Select different cleaner
5. Click "Assign"

## API Endpoints Used

### Assign/Reassign
```
POST /api/bookings/{id}/assign_cleaner/
Body: { "cleaner_id": 123 }
```

### Get Cleaners List
```
GET /api/admin/cleaners/available/
```

## Test
```bash
cd backend
python manage.py test test_admin_assign_cleaner
```

## UI Changes
- **Assign button** now shows for:
  - PENDING
  - WAITING_FOR_CLEANER
  - ASSIGNED (as "Reassign")
  - IN_PROGRESS (as "Reassign")
  
- **Does NOT show for:**
  - COMPLETED
  - CANCELLED

- **Modal displays:**
  - Booking details
  - Current cleaner (when reassigning)
  - List of available cleaners
  - Task counts per cleaner

## Key Features
✅ Assign to new bookings
✅ Reassign existing assignments
✅ View cleaner workload
✅ Auto-sorted by availability
✅ Admin-only access
✅ Validation (cleaner must exist, be active, have CLEANER role)
✅ Notifications sent to student and cleaner
✅ Email notifications
