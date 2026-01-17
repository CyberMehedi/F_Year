# Admin Assign Cleaner Feature - Implementation Summary

## Overview
Admin users can now assign and reassign cleaners to bookings from the BookingsManagement page.

## Changes Made

### 1. Frontend (1 file)
**File:** `frontend/src/pages/admin/BookingsManagement.js`

**Changes:**
- **Extended Assign button visibility** - Now shows for all non-completed/non-cancelled bookings (not just PENDING/WAITING_FOR_CLEANER)
- **Button text** - Shows "Assign" for unassigned bookings, "Reassign" for already assigned bookings
- **Modal title** - Shows "Assign Cleaner" or "Reassign Cleaner" based on current assignment status
- **Current cleaner display** - Modal shows current assigned cleaner when reassigning

**Lines changed:** ~20 lines modified

### 2. Backend (No changes required)
**Existing endpoints used:**
- `POST /api/bookings/{id}/assign_cleaner/` - Already exists, fully functional
- `GET /api/admin/cleaners/available/` - Already exists, returns cleaners sorted by workload

**Existing functionality:**
- Assignment validation (cleaner exists, is active, has CLEANER role)
- Admin authorization check
- Status update (sets to ASSIGNED)
- Notifications (to student and cleaner)
- Email notifications
- Deletes pending NEW_BOOKING notifications

### 3. Tests (1 new file)
**File:** `backend/test_admin_assign_cleaner.py`

**Test cases:**
1. Admin can assign cleaner to unassigned booking
2. Admin can reassign different cleaner
3. Non-admin cannot assign cleaners
4. Invalid cleaner ID fails
5. Missing cleaner_id fails
6. Cannot assign non-cleaner user
7. Available cleaners endpoint works

## API Contract

### Assign/Reassign Cleaner
```
POST /api/bookings/{id}/assign_cleaner/
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "cleaner_id": 123
}

Response 200 OK:
{
  "id": 1,
  "student": 456,
  "assigned_cleaner": 123,
  "assigned_cleaner_name": "John Doe",
  "status": "ASSIGNED",
  ...
}

Response 400 Bad Request:
{
  "error": "cleaner_id is required"
}

Response 404 Not Found:
{
  "error": "Cleaner not found or inactive"
}

Response 403 Forbidden:
{
  "detail": "You do not have permission to perform this action."
}
```

### Get Available Cleaners
```
GET /api/admin/cleaners/available/
Authorization: Bearer {admin_token}

Response 200 OK:
[
  {
    "id": 123,
    "email": "cleaner@example.com",
    "name": "John Doe",
    "role": "CLEANER",
    "phone_number": "+60123456789",
    "today_tasks": 2,
    "active_tasks": 5,
    "cleaner_profile": {
      "staff_id": "C001",
      "phone": "+60123456789",
      "assigned_blocks": "25E,26F",
      "is_active": true
    }
  },
  ...
]
```

## UI Location

**Where:** Admin Dashboard → Bookings Management Page (`/admin/bookings`)

**Controls:**
1. **Assign/Reassign button** - In the "Actions" column of the bookings table
   - Visible for all non-completed and non-cancelled bookings
   - Shows "Assign" if no cleaner assigned
   - Shows "Reassign" if cleaner already assigned

2. **Assignment Modal** - Opens when clicking Assign/Reassign
   - Shows booking details (student, room, type, date/time)
   - Shows current cleaner (when reassigning)
   - Lists all active cleaners with:
     - Name, email, phone
     - Today's task count
     - Active task count
   - Cleaners sorted by availability (least busy first)
   - Click cleaner card to select
   - "Assign" button to confirm
   - "Cancel" button to close

## Manual Testing Steps

### Test 1: Assign Cleaner to New Booking
1. Login as Admin (`admin@test.com` / password)
2. Navigate to `/admin/bookings`
3. Find a booking with status "WAITING_FOR_CLEANER" or "PENDING"
4. Click "Assign" button in the Actions column
5. Modal opens showing booking details
6. Click on a cleaner card to select
7. Click "Assign" button
8. Verify success toast appears
9. Verify booking table updates showing assigned cleaner name
10. Verify booking status changes to "ASSIGNED"

### Test 2: Reassign Cleaner
1. Find a booking that already has an assigned cleaner
2. Click "Reassign" button
3. Modal shows current cleaner in booking details
4. Select a different cleaner
5. Click "Assign" button
6. Verify success toast
7. Verify cleaner name updates in table

### Test 3: View Available Cleaners
1. In the assignment modal, verify cleaners are displayed with:
   - Name
   - Email
   - Phone number
   - Today's task count
   - Active task count
2. Verify cleaners are sorted by active_tasks (least busy first)

### Test 4: Cancel Assignment
1. Click "Assign" button
2. Modal opens
3. Click "Cancel" button
4. Verify modal closes without making changes

### Test 5: Error Handling
1. Try to assign without selecting a cleaner
2. Verify error toast: "Please select a cleaner"

### Test 6: Backend Validation
1. Open browser DevTools → Network tab
2. Assign a cleaner
3. Verify POST request to `/api/bookings/{id}/assign_cleaner/`
4. Verify request body: `{"cleaner_id": 123}`
5. Verify response contains updated booking with assigned_cleaner field

## Backend Test Execution

```bash
cd backend
python manage.py test test_admin_assign_cleaner
```

Expected output:
```
Creating test database...
........
----------------------------------------------------------------------
Ran 8 tests in X.XXXs

OK
```

## Files Changed Summary

| File | Type | Change |
|------|------|--------|
| `frontend/src/pages/admin/BookingsManagement.js` | Modified | Extended assign button to all non-final statuses, added reassign UI |
| `backend/test_admin_assign_cleaner.py` | New | 8 test cases for assignment functionality |

**Total:** 2 files (1 modified, 1 new)

## No Changes Made To

✅ Database schema - Used existing `assigned_cleaner` field  
✅ Backend endpoints - Used existing `assign_cleaner` and `available_cleaners` endpoints  
✅ Payment logic - No changes  
✅ Receipt logic - No changes  
✅ Status flow logic - Uses existing status transitions  
✅ Cleaner app UI - No changes  
✅ Routing - No new routes  
✅ Permissions - Uses existing IsAdmin permission  

## Benefits

1. **Flexibility** - Admin can assign cleaners at any stage (not just initial)
2. **Reassignment** - Can change cleaner if needed (sickness, better match, etc.)
3. **Visibility** - Shows current cleaner when reassigning
4. **Smart selection** - Cleaners sorted by workload for balanced assignment
5. **No breaking changes** - All existing functionality preserved

## Rollback Instructions

If needed, revert the frontend changes:

```bash
cd frontend/src/pages/admin
git checkout HEAD -- BookingsManagement.js
```

Delete test file:
```bash
rm backend/test_admin_assign_cleaner.py
```

Backend endpoints remain unchanged, so no rollback needed there.
