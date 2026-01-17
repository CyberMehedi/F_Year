# Booking Assignment - Quick Test Guide

## Prerequisites
- Django server running: `python manage.py runserver`
- React frontend running: `npm start`
- At least 2 cleaners in database with `is_active=True`
- At least 1 student account
- Admin account

---

## Test 1: Admin Manual Assignment ⚡

### Steps:
1. **Create Test Booking (as Student)**
   ```
   - Login as student
   - Navigate to "New Booking"
   - Fill form:
     * Block: "12A"
     * Room: "101"
     * Type: "STANDARD"
     * Date: Tomorrow
     * Time: "MORNING"
   - Submit booking
   - Verify status shows "WAITING_FOR_CLEANER"
   ```

2. **Assign Cleaner (as Admin)**
   ```
   - Login as admin
   - Navigate to "Bookings Management"
   - Find the booking you just created
   - Click "Assign" button
   - Modal appears showing available cleaners
   - Verify cleaners show task counts (e.g., "Today: 0, Active: 2")
   - Select any cleaner
   - Click "Assign" button
   - Verify success toast appears
   ```

3. **Verify Assignment**
   ```
   - Booking row should update immediately
   - Status changes to "ASSIGNED"
   - Cleaner column shows cleaner name
   - Assigned cleaner should receive email
   - Student should receive email
   ```

4. **Check Cleaner Dashboard**
   ```
   - Login as the assigned cleaner
   - Navigate to "All Tasks" or "Today's Tasks"
   - Verify booking appears in their task list
   - Booking should NOT appear in "New Requests" anymore
   ```

5. **Check Student Dashboard**
   ```
   - Login as student
   - Navigate to "My Bookings"
   - Find the booking
   - Verify it shows assigned cleaner name
   - Verify status is "ASSIGNED"
   ```

### Expected Results ✅
- ✅ Admin can assign any active cleaner
- ✅ Cleaner workload displayed (sorted by availability)
- ✅ Booking status updates to ASSIGNED
- ✅ Both cleaner and student receive emails
- ✅ Booking moves from "New Requests" to cleaner's task list
- ✅ No errors or warnings in console

---

## Test 2: Cleaner Self-Acceptance (No Race) 🏃

### Steps:
1. **Create Test Booking**
   ```
   - Login as student
   - Create another booking with different details
   - Logout
   ```

2. **Accept Booking (as Cleaner)**
   ```
   - Login as ANY cleaner
   - Navigate to "New Requests"
   - Find the booking
   - Click "Accept" button
   - Verify loading state appears
   - Verify success message appears
   ```

3. **Verify Acceptance**
   ```
   - Booking should disappear from "New Requests"
   - Booking should appear in "Today's Tasks" or "All Tasks"
   - Student should receive email notification
   ```

4. **Check Other Cleaners**
   ```
   - Login as different cleaner
   - Navigate to "New Requests"
   - Verify the booking is NOT in their list anymore
   ```

### Expected Results ✅
- ✅ Cleaner can accept booking
- ✅ Success message appears
- ✅ Booking moves to cleaner's task list
- ✅ Student receives acceptance email
- ✅ Other cleaners don't see the booking anymore

---

## Test 3: Race Condition (Simultaneous Acceptance) 🏎️💥

### Setup:
This test requires 2 browser windows or incognito mode.

### Steps:
1. **Prepare Booking**
   ```
   - Login as student
   - Create booking
   - Verify status = WAITING_FOR_CLEANER
   - Logout
   ```

2. **Login Two Cleaners Simultaneously**
   ```
   - Browser 1: Login as Cleaner A
   - Browser 2: Login as Cleaner B (incognito/different browser)
   - Both navigate to "New Requests"
   - Both should see the same booking
   ```

3. **Simultaneous Accept**
   ```
   - Both cleaners click "Accept" at the same time
   - (You need to be quick!)
   ```

4. **Observe Results**
   ```
   - First cleaner: Success message
   - Second cleaner: Error message "Already accepted by another cleaner"
   - Refresh both browsers
   - Only first cleaner should see booking in their tasks
   ```

### Expected Results ✅
- ✅ Only ONE cleaner succeeds
- ✅ Second cleaner gets clear error message
- ✅ No duplicate assignments in database
- ✅ Only student receives ONE acceptance notification
- ✅ Second cleaner's notification deleted
- ✅ Booking shows correct assigned cleaner

---

## Test 4: Admin Overrides Waiting State 🛡️

### Steps:
1. **Create Booking**
   ```
   - Login as student
   - Create booking
   - Status should be WAITING_FOR_CLEANER
   ```

2. **Admin Assigns Before Anyone Accepts**
   ```
   - Login as admin
   - Navigate to Bookings Management
   - Assign specific cleaner to the booking
   ```

3. **Try to Accept as Different Cleaner**
   ```
   - Login as different cleaner (not the assigned one)
   - Try to navigate to "New Requests"
   - Booking should NOT appear in list
   ```

4. **If Cleaner Somehow Gets Old Notification**
   ```
   - If cleaner still has notification, click it
   - Try to accept
   - Should get error: "Already accepted" or 404
   ```

### Expected Results ✅
- ✅ Admin assignment is immediate
- ✅ All cleaner notifications deleted
- ✅ Other cleaners can't see the booking
- ✅ Only assigned cleaner sees it in their tasks

---

## Test 5: Cleaner Workload Display 📊

### Setup:
```
- Create 5 bookings
- Assign 3 to Cleaner A (2 today, 1 future)
- Assign 1 to Cleaner B (1 today)
- Leave 1 unassigned (WAITING_FOR_CLEANER)
```

### Steps:
1. **Open Admin Assignment Modal**
   ```
   - Login as admin
   - Find the unassigned booking
   - Click "Assign" button
   ```

2. **Verify Cleaner Display**
   ```
   - Cleaners should be sorted by workload
   - Cleaner B should appear first (less busy)
   - Cleaner A should appear second
   - Each cleaner should show:
     * Name
     * Email
     * Phone (if available)
     * Today's tasks count
     * Active tasks count
   ```

3. **Select Cleaner**
   ```
   - Click on a cleaner card
   - Card should highlight with blue border
   - Click "Assign" button
   ```

### Expected Results ✅
- ✅ Cleaners sorted by least busy first
- ✅ Task counts accurate
- ✅ Visual selection feedback
- ✅ Assignment succeeds

---

## Test 6: Email Notifications 📧

### Setup:
Ensure email settings configured in `.env`:
```
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Test Admin Assignment Emails:
1. **Assign Cleaner via Admin**
   ```
   - Admin assigns cleaner to booking
   ```

2. **Check Cleaner Email**
   ```
   Subject: Admin Assignment - New Task
   
   Should contain:
   - "The administrator has assigned you"
   - Task details
   - Student name
   - Location
   - Date/time
   ```

3. **Check Student Email**
   ```
   Subject: Cleaner Assigned to Your Request
   
   Should contain:
   - "A cleaner has been assigned"
   - Cleaner name
   - Booking details
   ```

### Test Cleaner Acceptance Emails:
1. **Cleaner Accepts Booking**
   ```
   - Cleaner clicks Accept on new request
   ```

2. **Check Student Email**
   ```
   Subject: Your Cleaning Request Has Been Accepted
   
   Should contain:
   - "Your request has been accepted"
   - Cleaner name, email, phone
   - Booking details
   ```

### Expected Results ✅
- ✅ Emails sent immediately after assignment/acceptance
- ✅ Email content accurate
- ✅ Links work (if included)
- ✅ No duplicate emails

---

## Test 7: Booking Status Workflow 🔄

### Test Complete Flow:
1. **Create Booking**
   ```
   Status: PENDING → WAITING_FOR_CLEANER
   ```

2. **Assign/Accept**
   ```
   Status: WAITING_FOR_CLEANER → ASSIGNED
   ```

3. **Cleaner Updates Status**
   ```
   Status: ASSIGNED → IN_PROGRESS
   ```

4. **Complete Task**
   ```
   Status: IN_PROGRESS → COMPLETED
   ```

### Verify Each Transition:
- Check booking list updates
- Check status colors change
- Check available actions change
- Check notifications sent appropriately

### Expected Results ✅
- ✅ Status transitions smooth
- ✅ Colors update correctly
- ✅ Actions available based on status
- ✅ All transitions logged

---

## Test 8: Error Handling 🚨

### Test Invalid Assignments:
1. **Assign Inactive Cleaner**
   ```
   - Manually set cleaner is_active = False
   - Try to assign via API
   - Expected: Error "Active cleaner not found"
   ```

2. **Assign Non-Existent Cleaner**
   ```
   POST /api/bookings/123/assign_cleaner/
   { "cleaner_id": 99999 }
   
   Expected: Error "Active cleaner not found"
   ```

3. **Accept Already Assigned Booking**
   ```
   - Cleaner A accepts booking
   - Cleaner B tries to accept same booking
   - Expected: Error "Already accepted by another cleaner"
   ```

4. **Missing cleaner_id**
   ```
   POST /api/bookings/123/assign_cleaner/
   {}
   
   Expected: Error "cleaner_id is required"
   ```

### Expected Results ✅
- ✅ All errors handled gracefully
- ✅ Clear error messages
- ✅ No server crashes
- ✅ Frontend shows error toasts

---

## Test 9: Performance 🚀

### Test Concurrent Requests:
1. **Create 10 Bookings**
2. **Have 5 Cleaners Accept Simultaneously**
   ```
   - Use browser dev tools to simulate
   - Or use API testing tool (Postman)
   - Send multiple requests at once
   ```

3. **Verify Results**
   ```
   - No duplicate assignments
   - All cleaners get appropriate responses
   - Database consistent
   ```

### Expected Results ✅
- ✅ No duplicate assignments
- ✅ Fast response times
- ✅ Database locks work correctly
- ✅ No deadlocks

---

## Test 10: UI/UX 🎨

### Test Admin UI:
- ✅ Modal appears smoothly
- ✅ Cleaner cards visually distinct
- ✅ Selection feedback clear
- ✅ Success/error toasts visible
- ✅ Loading states appear
- ✅ Table updates without page reload

### Test Cleaner UI:
- ✅ Accept button prominent
- ✅ Loading spinner during acceptance
- ✅ Error messages clear
- ✅ Task list updates after acceptance
- ✅ New requests update in real-time

### Test Student UI:
- ✅ Assignment status clear
- ✅ Cleaner info displayed
- ✅ Status colors meaningful
- ✅ Booking history accessible

---

## Automated Testing (Optional) 🤖

### Using Python Requests:
```python
import requests

BASE_URL = "http://localhost:8000/api"

# Login as admin
admin_token = "your-admin-token"
headers = {"Authorization": f"Bearer {admin_token}"}

# Get available cleaners
response = requests.get(f"{BASE_URL}/admin/cleaners/available/", headers=headers)
cleaners = response.json()
print(f"Found {len(cleaners)} active cleaners")

# Assign cleaner
booking_id = 123
cleaner_id = cleaners[0]['id']
response = requests.post(
    f"{BASE_URL}/bookings/{booking_id}/assign_cleaner/",
    json={"cleaner_id": cleaner_id},
    headers=headers
)
print(response.json())
```

### Using Django Test Framework:
```python
# tests/test_assignment.py
from django.test import TestCase
from api.models import User, Booking

class BookingAssignmentTests(TestCase):
    def test_admin_assignment(self):
        # Create test data
        admin = User.objects.create(role='ADMIN', ...)
        cleaner = User.objects.create(role='CLEANER', ...)
        booking = Booking.objects.create(status='WAITING_FOR_CLEANER', ...)
        
        # Assign cleaner
        self.client.force_login(admin)
        response = self.client.post(
            f'/api/bookings/{booking.id}/assign_cleaner/',
            {'cleaner_id': cleaner.id}
        )
        
        self.assertEqual(response.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.assigned_cleaner, cleaner)
        self.assertEqual(booking.status, 'ASSIGNED')
```

---

## Common Test Failures & Solutions 🔧

### Failure: "Cleaner not found"
**Solution:**
- Check cleaner `is_active=True`
- Verify cleaner role is 'CLEANER'
- Check cleaner ID is correct

### Failure: "Task already accepted"
**Solution:**
- This is expected when testing race conditions
- Verify only one cleaner assigned
- Check notifications deleted properly

### Failure: "Emails not sending"
**Solution:**
- Check `.env` email configuration
- Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
- Check Gmail "Less secure apps" or app password
- Look at Django console for email errors

### Failure: "Modal not showing cleaners"
**Solution:**
- Check API response in browser dev tools
- Verify `availableCleaners()` endpoint working
- Check console for JavaScript errors
- Verify cleaners exist in database

### Failure: "Booking not updating in UI"
**Solution:**
- Check browser console for errors
- Verify `fetchBookings()` called after assignment
- Check API response includes updated booking
- Try hard refresh (Ctrl+Shift+R)

---

## Test Checklist ✅

Use this checklist to ensure comprehensive testing:

- [ ] Admin can assign cleaner to PENDING booking
- [ ] Admin can assign cleaner to WAITING_FOR_CLEANER booking
- [ ] Cleaner workload displays correctly
- [ ] Cleaners sorted by availability
- [ ] Cleaner can accept new request
- [ ] Race condition handled (only one succeeds)
- [ ] Admin assignment deletes cleaner notifications
- [ ] Cleaner acceptance deletes other notifications
- [ ] Only student receives acceptance notification
- [ ] Emails sent for admin assignments
- [ ] Emails sent for cleaner acceptances
- [ ] Status transitions work correctly
- [ ] UI updates without page reload
- [ ] Error messages clear and helpful
- [ ] Loading states visible
- [ ] Toast notifications appear
- [ ] Database consistent after all operations
- [ ] No duplicate assignments possible
- [ ] Inactive cleaners not assignable
- [ ] Non-existent cleaners handled

---

## Done! 🎉

If all tests pass, your booking assignment system is working perfectly!

**Key Achievements:**
- ✅ Two assignment methods working
- ✅ Race conditions prevented
- ✅ Notifications managed properly
- ✅ Emails sent correctly
- ✅ UI smooth and responsive
- ✅ Error handling robust
- ✅ Database integrity maintained

**Next Steps:**
- Deploy to production
- Monitor for any issues
- Collect user feedback
- Consider additional features (auto-assignment, preferences, etc.)
