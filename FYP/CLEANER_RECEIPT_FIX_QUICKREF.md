# Cleaner Receipt Fix - Quick Reference

## Issue
Cleaner users couldn't see payment receipt links.

## Root Cause  
Backend API missing `context={'request': request}` in 4 serializer calls.

## Fix (4 lines changed)
**File:** `backend/api/views.py`

Add `context={'request': request}` to:
- Line 524: `cleaner_new_requests`
- Line 615: `cleaner_today_tasks`  
- Line 632: `cleaner_all_tasks`
- Line 647: `cleaner_history`

## Verify Fix

### Quick API Test
```bash
cd backend
python manage.py shell
```
```python
from api.models import Booking
from api.serializers import BookingSerializer
from rest_framework.test import APIRequestFactory

# Get booking with receipt
b = Booking.objects.filter(payment_receipt__isnull=False).first()

# Test serializer
factory = APIRequestFactory()
req = factory.get('/')
s = BookingSerializer(b, context={'request': req})

# Should print full URL
print(s.data.get('payment_receipt_url'))
```

### Manual UI Test
1. Login as Cleaner
2. Go to "My History"
3. See "View Receipt →" button (not "No receipt")
4. Click button → Opens receipt in new tab

## Files Changed
1. ✅ `backend/api/views.py` - 4 lines (added context)
2. ✅ `frontend/src/pages/cleaner/MyHistory.js` - UI display (done previously)
3. ✅ `frontend/src/pages/cleaner/AllTasks.js` - UI display (done previously)

## Not Changed
- ❌ Admin dashboard (per requirement)
- ❌ Database schema
- ❌ Payment logic

## Result
✅ Cleaner users can now see and click payment receipts
