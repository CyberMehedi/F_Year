# Cleaner Report Issues Bug Fix - Summary

## Bug Description
When cleaners tried to submit an issue report from the Report Issues page, they received a red toast error: "Failed to report issue". The API call was failing silently with no specific error details shown to the user.

## Root Causes Identified

### 1. Issue Type Mismatch (400 Bad Request)
**Problem:** Frontend was sending invalid issue_type values that didn't match backend enum choices.

- **Frontend sent:** `EQUIPMENT_MALFUNCTION`, `CLEANLINESS_CONCERN`, `SAFETY_HAZARD`, `MAINTENANCE_NEEDED`, `SUPPLY_SHORTAGE`, `OTHER`
- **Backend expected:** `PLUMBING`, `ELECTRICAL`, `DAMAGE`, `OTHER`

### 2. Missing Required Booking Field (400 Bad Request)
**Problem:** Backend requires `booking` (ForeignKey) to link issues to specific cleaning tasks, but frontend was removing it before submission.

**Original code:**
```javascript
const { booking, ...submitData } = formData;  // ❌ Removed booking
await issueAPI.create(submitData);
```

**Issue:** The `Issue` model has `booking` as a required ForeignKey with no `null=True`, so the API would reject any submission without it.

### 3. Poor Error Handling
**Problem:** Generic error message didn't show actual API validation errors.

**Original:**
```javascript
catch (error) {
  setToast({ message: 'Failed to report issue', type: 'error' });  // ❌ Generic
}
```

## Solution Implemented

### Changes to: `frontend/src/pages/cleaner/ReportIssues.js`

#### 1. Added Booking Fetching (Lines 1-50)
```javascript
// Added imports
import LoadingSpinner from '../../components/LoadingSpinner';
import { issueAPI, cleanerAPI } from '../../api/api';  // Added cleanerAPI

// Added state
const [loading, setLoading] = useState(true);
const [bookings, setBookings] = useState([]);

// Fetch cleaner's tasks on mount
useEffect(() => {
  fetchBookings();
}, []);

const fetchBookings = async () => {
  try {
    const response = await cleanerAPI.allTasks();
    const relevantBookings = response.data.filter(
      booking => ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)
    );
    setBookings(relevantBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    setToast({ message: 'Error loading your tasks', type: 'error' });
  } finally {
    setLoading(false);
  }
};
```

#### 2. Fixed Issue Type Values (Lines 130-142)
```javascript
// OLD (wrong values):
<option value="EQUIPMENT_MALFUNCTION">🔧 Equipment Malfunction</option>
<option value="CLEANLINESS_CONCERN">🧹 Cleanliness Concern</option>
<option value="SAFETY_HAZARD">⚠️ Safety Hazard</option>
<option value="MAINTENANCE_NEEDED">🔨 Maintenance Needed</option>
<option value="SUPPLY_SHORTAGE">📦 Supply Shortage</option>
<option value="OTHER">📝 Other</option>

// NEW (matches backend):
<option value="PLUMBING">🚰 Plumbing</option>
<option value="ELECTRICAL">⚡ Electrical</option>
<option value="DAMAGE">💥 Damage</option>
<option value="OTHER">📝 Other</option>
```

#### 3. Added Booking Selector (Lines 96-119)
```javascript
{/* Booking Selection */}
<div className="md:col-span-2">
  <label className="block text-sm font-semibold text-gray-900 mb-2">
    Select Task/Booking *
  </label>
  <select
    name="booking"
    value={formData.booking}
    onChange={handleChange}
    required
  >
    <option value="">Select a task...</option>
    {bookings.map(booking => (
      <option key={booking.id} value={booking.id}>
        #{booking.id} - {booking.block} {booking.room_number} - {booking.booking_type} ({new Date(booking.preferred_date).toLocaleDateString()})
      </option>
    ))}
  </select>
  {bookings.length === 0 && (
    <p className="mt-2 text-sm text-amber-600">
      You don't have any assigned tasks. Issues must be reported for specific tasks.
    </p>
  )}
</div>
```

#### 4. Fixed Submit Handler (Lines 56-82)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate booking is selected
  if (!formData.booking) {
    setToast({ message: 'Please select a task/booking', type: 'error' });
    return;
  }
  
  if (!formData.description) {
    setToast({ message: 'Please provide a description', type: 'error' });
    return;
  }

  setSubmitting(true);
  try {
    // Send all formData including booking ✅
    await issueAPI.create(formData);
    setToast({ message: 'Issue reported successfully', type: 'success' });
    setFormData({
      booking: '',
      issue_type: 'OTHER',
      description: '',
      photo_url: '',
    });
  } catch (error) {
    console.error('Error reporting issue:', error);
    // Show specific error from API ✅
    const errorMessage = error.response?.data?.error 
      || error.response?.data?.message 
      || error.response?.data?.detail
      || 'Failed to report issue';
    setToast({ message: errorMessage, type: 'error' });
  } finally {
    setSubmitting(false);
  }
};
```

#### 5. Added Loading State
```javascript
{loading ? (
  <div className="flex justify-center items-center py-12">
    <LoadingSpinner />
  </div>
) : (
  <>{/* Form content */}</>
)}
```

## Files Changed

1. ✅ **frontend/src/pages/cleaner/ReportIssues.js** - Fixed issue submission flow

**Total:** 1 file modified

## What Was NOT Changed

✅ Backend (no changes needed - model and API were correct)  
✅ Database schema  
✅ Other pages or components  
✅ Admin dashboard  
✅ Payment/receipt logic  
✅ Routing  

## API Request/Response

### Request (After Fix)
```http
POST /api/issues/
Authorization: Bearer {cleaner_token}
Content-Type: application/json

{
  "booking": 123,
  "issue_type": "PLUMBING",
  "description": "Leaking sink in room 25E-04-10",
  "photo_url": ""
}
```

### Response Success (201 Created)
```json
{
  "id": 456,
  "booking": 123,
  "booking_details": {
    "id": 123,
    "room_number": "25E-04-10",
    "block": "25E",
    "booking_type": "DEEP"
  },
  "reported_by": 789,
  "reported_by_name": "John Cleaner",
  "issue_type": "PLUMBING",
  "description": "Leaking sink in room 25E-04-10",
  "photo_url": "",
  "status": "OPEN",
  "assigned_staff": null,
  "created_at": "2025-12-27T10:30:00Z",
  "updated_at": "2025-12-27T10:30:00Z"
}
```

## Manual Verification Steps

### 1. Login as Cleaner
```
Email: cleaner@test.com
Password: (your cleaner password)
```

### 2. Navigate to Report Issues
- Go to Cleaner Dashboard
- Click "Report Issues" in sidebar
- URL: `/cleaner/issues`

### 3. Verify UI Changes
- ✅ Page loads with spinner (while fetching tasks)
- ✅ "Select Task/Booking" dropdown appears at top
- ✅ Dropdown shows cleaner's assigned/completed tasks
- ✅ Issue Type dropdown shows: Plumbing, Electrical, Damage, Other

### 4. Submit an Issue
1. Select a task from "Select Task/Booking" dropdown
2. Select "Plumbing" from Issue Type
3. Enter description: "Test issue report"
4. Click "Submit Issue Report"

### 5. Expected Results
- ✅ Green success toast: "Issue reported successfully"
- ✅ Form clears/resets
- ✅ No red error toast
- ✅ Check browser Network tab: POST to `/api/issues/` returns 201

### 6. Verify API Call (Browser DevTools)
**Network Tab → issues → Payload:**
```json
{
  "booking": 123,
  "issue_type": "PLUMBING",
  "description": "Test issue report",
  "photo_url": ""
}
```

**Response Status:** 201 Created

### 7. Edge Cases to Test
- **No tasks:** If cleaner has no tasks, see warning message
- **Validation:** Try submitting without selecting task → Error toast
- **Error handling:** If API fails (network issue), see specific error message

## Before vs After

### Before Fix ❌
```
User Action: Submit issue report
API Call: ❌ 400 Bad Request
  - Wrong issue_type values (EQUIPMENT_MALFUNCTION vs PLUMBING)
  - Missing required booking field
User Sees: "Failed to report issue" (generic)
```

### After Fix ✅
```
User Action: Submit issue report
API Call: ✅ 201 Created
  - Correct issue_type (PLUMBING, ELECTRICAL, DAMAGE, OTHER)
  - booking field included and valid
User Sees: "Issue reported successfully" (green toast)
Form: Resets and ready for next report
```

## Testing

To test manually:
1. Ensure backend is running: `cd backend && python manage.py runserver`
2. Ensure frontend is running: `cd frontend && npm start`
3. Login as cleaner
4. Complete a cleaning task (or have admin assign one)
5. Go to Report Issues page
6. Fill out form and submit
7. ✅ Should succeed with green toast

## Summary

**What was failing:** 
- Issue type values didn't match backend enum (400 error)
- Required booking field was missing (400 error)
- Generic error messages hid the root cause

**How it's fixed:**
- Changed issue_type values to match backend: PLUMBING, ELECTRICAL, DAMAGE, OTHER
- Added booking selector that fetches cleaner's tasks
- Include booking field in API submission
- Show specific error messages from API responses
- Added loading state while fetching tasks

**Result:** Cleaners can now successfully report issues for their assigned tasks with proper validation and clear error messages.
