# Implementation Guide for Remaining Pages

This guide helps you implement the remaining placeholder pages following the established patterns in the project.

## Overview

The following pages are currently placeholders and need full implementation:

### Student Pages
- ✅ StudentDashboard - COMPLETED
- ✅ BookService - COMPLETED
- ⚠️ MyBookings - TO BE IMPLEMENTED
- ⚠️ History - TO BE IMPLEMENTED
- ⚠️ Profile - TO BE IMPLEMENTED
- ⚠️ Notifications - TO BE IMPLEMENTED

### Cleaner Pages
- ⚠️ CleanerDashboard - TO BE IMPLEMENTED
- ⚠️ NewRequests - TO BE IMPLEMENTED
- ⚠️ TodayTasks - TO BE IMPLEMENTED
- ⚠️ AllTasks - TO BE IMPLEMENTED
- ⚠️ MyHistory - TO BE IMPLEMENTED
- ⚠️ Issues - TO BE IMPLEMENTED
- ⚠️ Stats - TO BE IMPLEMENTED

### Admin Pages
- ⚠️ AdminDashboard - TO BE IMPLEMENTED
- ⚠️ BookingsManagement - TO BE IMPLEMENTED
- ⚠️ StaffManagement - TO BE IMPLEMENTED
- ⚠️ Maintenance - TO BE IMPLEMENTED
- ⚠️ Reports - TO BE IMPLEMENTED

---

## General Page Structure Pattern

Every page should follow this structure:

```javascript
import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { apiFunction } from '../../api/api';

const PageName = () => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Menu items for sidebar
  const menuItems = [
    // Define menu items for this role
  ];

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // API call function
  const fetchData = async () => {
    try {
      const response = await apiFunction();
      setData(response.data);
    } catch (error) {
      setToast({ 
        message: 'Error loading data', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const handleAction = async (item) => {
    // Handle action logic
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Main render
  return (
    <div className="flex min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <DashboardSidebar role="ROLE_NAME" menuItems={menuItems} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Page content here */}
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <Modal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)}
          title="Modal Title"
        >
          {/* Modal content */}
        </Modal>
      )}
    </div>
  );
};

export default PageName;
```

---

## Student Pages Implementation

### 1. MyBookings.js

**Purpose**: Display all current and upcoming bookings

**API Endpoint**: `bookingAPI.myBookings()`

**Key Features**:
- List all bookings with status badges
- Filter by status (All, Pending, Assigned, In Progress)
- View booking details in modal
- Cancel booking button (if allowed)
- Refresh button

**Implementation Steps**:
1. Fetch bookings from API
2. Display in table or card grid
3. Add status filter dropdown
4. Implement cancel booking function
5. Show booking details modal
6. Add pagination if needed

**Status Colors**:
```javascript
const getStatusColor = (status) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
```

### 2. History.js

**Purpose**: Display completed and cancelled bookings

**API Endpoint**: `bookingAPI.history()`

**Key Features**:
- List past bookings
- Show completion date
- Display cleaner name
- Show price paid
- Search/filter functionality

**Similar to MyBookings** but filtered for completed/cancelled status.

### 3. Profile.js

**Purpose**: View and edit student profile

**API Endpoints**: 
- GET: `profileAPI.getStudent()`
- PUT: `profileAPI.updateStudent(data)`

**Key Features**:
- Display current profile info
- Edit mode toggle
- Update name, phone, block, room number
- Validation on form fields
- Save changes button

**Fields**:
- Name (editable)
- Email (readonly)
- Student ID (readonly)
- Block (editable with validation)
- Room Number (editable with validation)
- Phone (editable)

### 4. Notifications.js

**Purpose**: Display all notifications

**API Endpoints**:
- `notificationAPI.list()`
- `notificationAPI.markRead(id)`
- `notificationAPI.markAllRead()`

**Key Features**:
- List notifications (newest first)
- Unread vs read styling
- Mark as read on click
- Mark all as read button
- Delete notification (optional)

**Notification Card**:
```javascript
<div className={`card ${notification.is_read ? 'opacity-60' : 'border-l-4 border-primary-600'}`}>
  <div className="flex justify-between items-start">
    <div>
      <h3 className="font-bold">{notification.title}</h3>
      <p className="text-gray-600">{notification.message}</p>
      <p className="text-xs text-gray-500 mt-2">
        {new Date(notification.created_at).toLocaleString()}
      </p>
    </div>
    {!notification.is_read && (
      <button onClick={() => markAsRead(notification.id)}>
        Mark as read
      </button>
    )}
  </div>
</div>
```

---

## Cleaner Pages Implementation

### 1. CleanerDashboard.js

**Purpose**: Overview of cleaner's tasks and statistics

**API Endpoints**:
- `cleanerAPI.todayTasks()`
- `cleanerAPI.stats()`

**Key Components**:
- Stats cards (today's tasks, completed this week, pending tasks)
- Today's schedule timeline
- Quick action buttons
- Recent task history

**Stats Display**:
```javascript
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="card bg-primary-600 text-white">
    <p className="text-primary-100">Tasks Today</p>
    <p className="text-4xl font-bold">{stats.today}</p>
  </div>
  {/* More stat cards */}
</div>
```

### 2. NewRequests.js

**Purpose**: Display newly assigned tasks

**API Endpoint**: `cleanerAPI.newRequests()`

**Key Features**:
- List tasks with ASSIGNED status
- Show booking details (type, time, room)
- Start task button
- View special instructions

### 3. TodayTasks.js

**Purpose**: Display today's scheduled tasks

**API Endpoint**: `cleanerAPI.todayTasks()`

**Key Features**:
- Timeline view of tasks
- Current time indicator
- Task status update buttons
- Mark as completed

**Timeline Display**:
```javascript
{tasks.map((task) => (
  <div className="flex gap-4 mb-4">
    <div className="flex flex-col items-center">
      <div className="w-3 h-3 rounded-full bg-primary-600" />
      <div className="w-0.5 h-full bg-gray-300" />
    </div>
    <div className="card flex-1">
      <div className="flex justify-between">
        <div>
          <p className="font-bold">{task.preferred_time}</p>
          <p>{task.booking_type} - {task.room_number}</p>
        </div>
        <button className="btn btn-primary btn-sm">
          Start Task
        </button>
      </div>
    </div>
  </div>
))}
```

### 4. AllTasks.js

**Purpose**: Display all assigned tasks (past and future)

**API Endpoint**: `cleanerAPI.allTasks()`

**Key Features**:
- Sortable table
- Filter by status
- Filter by date range
- Search by room number

### 5. MyHistory.js

**Purpose**: Display completed tasks

**API Endpoint**: `cleanerAPI.history()`

**Similar to AllTasks** but filtered for completed status.

### 6. Issues.js

**Purpose**: Report maintenance issues

**API Endpoints**:
- GET: `issueAPI.list()`
- POST: `issueAPI.create(data)`

**Key Features**:
- Form to report new issue
- Select related booking
- Issue type dropdown
- Description textarea
- Photo URL field (optional)
- List of previously reported issues

**Issue Form**:
```javascript
<form onSubmit={handleSubmit}>
  <div>
    <label>Related Booking</label>
    <select name="booking" required>
      <option value="">Select booking...</option>
      {bookings.map(b => (
        <option key={b.id} value={b.id}>
          {b.room_number} - {b.preferred_date}
        </option>
      ))}
    </select>
  </div>
  
  <div>
    <label>Issue Type</label>
    <select name="issue_type" required>
      <option value="PLUMBING">Plumbing</option>
      <option value="ELECTRICAL">Electrical</option>
      <option value="DAMAGE">Damage</option>
      <option value="OTHER">Other</option>
    </select>
  </div>
  
  <div>
    <label>Description</label>
    <textarea name="description" required />
  </div>
  
  <button type="submit">Report Issue</button>
</form>
```

### 7. Stats.js

**Purpose**: Display cleaner performance statistics

**API Endpoint**: `cleanerAPI.stats()`

**Key Features**:
- Completed tasks today/week/month
- Task type distribution pie chart
- Pending issues count
- Performance trends

**Chart Implementation** (using simple HTML/CSS or a library like Chart.js):
```javascript
// Simple bar chart with divs
<div className="space-y-2">
  {stats.type_distribution.map(item => (
    <div key={item.booking_type}>
      <div className="flex justify-between mb-1">
        <span>{item.booking_type}</span>
        <span>{item.count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full"
          style={{ width: `${(item.count / totalTasks) * 100}%` }}
        />
      </div>
    </div>
  ))}
</div>
```

---

## Admin Pages Implementation

### 1. AdminDashboard.js

**Purpose**: Overview of entire system

**API Endpoint**: `adminAPI.stats()`

**Key Components**:
- High-level statistics cards
- Pending bookings list
- Open issues list
- Recent activity
- Quick action buttons

**Stats Grid**:
```javascript
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <div className="card">
    <p className="text-gray-600">Bookings Today</p>
    <p className="text-3xl font-bold">{stats.bookings_today}</p>
  </div>
  <div className="card">
    <p className="text-gray-600">Pending Bookings</p>
    <p className="text-3xl font-bold">{stats.pending_bookings}</p>
  </div>
  <div className="card">
    <p className="text-gray-600">Active Cleaners</p>
    <p className="text-3xl font-bold">{stats.active_cleaners}</p>
  </div>
  <div className="card">
    <p className="text-gray-600">Open Issues</p>
    <p className="text-3xl font-bold">{stats.open_issues}</p>
  </div>
</div>
```

### 2. BookingsManagement.js

**Purpose**: Manage all bookings

**API Endpoints**:
- `bookingAPI.list()`
- `bookingAPI.assignCleaner(id, cleanerId)`
- `bookingAPI.updateStatus(id, status)`

**Key Features**:
- Filterable table of all bookings
- Assign cleaner modal
- Update status dropdown
- View booking details
- Search functionality

**Assign Cleaner Modal**:
```javascript
<Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Cleaner">
  <div>
    <label>Select Cleaner</label>
    <select value={selectedCleaner} onChange={(e) => setSelectedCleaner(e.target.value)}>
      <option value="">Choose cleaner...</option>
      {cleaners.map(cleaner => (
        <option key={cleaner.id} value={cleaner.id}>
          {cleaner.name} - {cleaner.cleaner_profile.staff_id}
        </option>
      ))}
    </select>
    <button onClick={handleAssign}>Assign</button>
  </div>
</Modal>
```

### 3. StaffManagement.js

**Purpose**: Manage cleaner accounts

**API Endpoints**:
- `adminAPI.cleanersList()`
- `adminAPI.toggleCleanerStatus(userId)`

**Key Features**:
- List all cleaners
- View cleaner details
- Toggle active/inactive status
- View assigned blocks
- Performance metrics per cleaner

**Cleaner Table**:
```javascript
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Staff ID</th>
      <th>Assigned Blocks</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {cleaners.map(cleaner => (
      <tr key={cleaner.id}>
        <td>{cleaner.name}</td>
        <td>{cleaner.cleaner_profile.staff_id}</td>
        <td>{cleaner.cleaner_profile.assigned_blocks}</td>
        <td>
          <span className={cleaner.is_active ? 'text-green-600' : 'text-red-600'}>
            {cleaner.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button onClick={() => toggleStatus(cleaner.id)}>
            {cleaner.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### 4. Maintenance.js

**Purpose**: Manage maintenance issues

**API Endpoints**:
- `issueAPI.list()`
- `issueAPI.updateStatus(id, {status, assigned_staff})`

**Key Features**:
- List all issues
- Filter by status (Open/In Progress/Resolved)
- Assign staff to issue
- Update issue status
- View issue details

**Issue Card with Actions**:
```javascript
{issues.map(issue => (
  <div className="card" key={issue.id}>
    <div className="flex justify-between">
      <div>
        <h3 className="font-bold">{issue.issue_type}</h3>
        <p>{issue.description}</p>
        <p className="text-sm text-gray-600">
          Room: {issue.booking_details.room_number}
        </p>
        <p className="text-sm text-gray-600">
          Reported by: {issue.reported_by_name}
        </p>
      </div>
      <div className="space-y-2">
        <select 
          value={issue.status}
          onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <input 
          type="text"
          placeholder="Assigned staff..."
          defaultValue={issue.assigned_staff}
          onBlur={(e) => updateAssignedStaff(issue.id, e.target.value)}
        />
      </div>
    </div>
  </div>
))}
```

### 5. Reports.js

**Purpose**: Generate and view reports

**API Endpoint**: `bookingAPI.list()` with filters

**Key Features**:
- Date range picker
- Filter by booking type, status, urgency
- Export data (optional)
- Statistics visualization
- Printable report view

**Report Filters**:
```javascript
<div className="card">
  <h2 className="text-xl font-bold mb-4">Generate Report</h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div>
      <label>Start Date</label>
      <input type="date" name="start_date" />
    </div>
    <div>
      <label>End Date</label>
      <input type="date" name="end_date" />
    </div>
    <div>
      <label>Booking Type</label>
      <select name="type">
        <option value="">All</option>
        <option value="DEEP">Deep Cleaning</option>
        <option value="STANDARD">Standard Cleaning</option>
      </select>
    </div>
    <div>
      <label>Status</label>
      <select name="status">
        <option value="">All</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  </div>
  <button onClick={generateReport}>Generate Report</button>
</div>

{/* Report display */}
<div className="card mt-6">
  <h3 className="text-lg font-bold mb-4">Report Results</h3>
  <div className="grid grid-cols-3 gap-4 mb-6">
    <div>
      <p className="text-gray-600">Total Bookings</p>
      <p className="text-2xl font-bold">{reportData.total}</p>
    </div>
    <div>
      <p className="text-gray-600">Total Revenue</p>
      <p className="text-2xl font-bold">RM {reportData.revenue}</p>
    </div>
    <div>
      <p className="text-gray-600">Completion Rate</p>
      <p className="text-2xl font-bold">{reportData.completion_rate}%</p>
    </div>
  </div>
  {/* Table of bookings */}
</div>
```

---

## Common Patterns & Best Practices

### 1. Error Handling
```javascript
try {
  const response = await apiFunction();
  setData(response.data);
  setToast({ message: 'Success!', type: 'success' });
} catch (error) {
  const errorMsg = error.response?.data?.detail || 
                   error.response?.data?.message || 
                   'An error occurred';
  setToast({ message: errorMsg, type: 'error' });
}
```

### 2. Loading States
```javascript
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
```

### 3. Empty States
```javascript
{data.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-500 mb-4">No data found</p>
    <button className="btn btn-primary">Add New</button>
  </div>
) : (
  // Display data
)}
```

### 4. Confirmation Dialogs
```javascript
const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this?')) {
    try {
      await deleteFunction(id);
      setToast({ message: 'Deleted successfully', type: 'success' });
      fetchData(); // Refresh list
    } catch (error) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  }
};
```

### 5. Date Formatting
```javascript
// Format date
new Date(dateString).toLocaleDateString('en-MY', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Format datetime
new Date(dateString).toLocaleString('en-MY', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
```

### 6. Search Functionality
```javascript
const [searchTerm, setSearchTerm] = useState('');

const filteredData = data.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.room_number.includes(searchTerm)
);

// In JSX
<input
  type="text"
  placeholder="Search..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="input-field"
/>
```

---

## Testing Checklist

For each implemented page:
- [ ] Page loads without errors
- [ ] Data fetches and displays correctly
- [ ] Loading spinner shows while fetching
- [ ] Empty state displays when no data
- [ ] Filters/search work correctly
- [ ] Forms validate input
- [ ] Success/error toasts show
- [ ] Actions (create, update, delete) work
- [ ] Modals open and close properly
- [ ] Responsive on mobile devices
- [ ] Navigation works correctly
- [ ] Logout works and clears data

---

## Priority Order for Implementation

### High Priority (Complete First)
1. Student MyBookings - Core functionality
2. Admin BookingsManagement - Essential for operation
3. Admin StaffManagement - Needed for cleaner assignment
4. Cleaner TodayTasks - Core cleaner functionality

### Medium Priority
5. Student History - Nice to have
6. Student Profile - User management
7. Cleaner NewRequests - Task management
8. Cleaner AllTasks - Task overview
9. Admin Maintenance - Issue tracking

### Lower Priority
10. Student Notifications - Enhancement
11. Cleaner Issues - Issue reporting
12. Cleaner MyHistory - Record keeping
13. Cleaner Stats - Analytics
14. Admin Reports - Analytics

---

## Quick Reference - API Endpoints

```javascript
// Authentication
authAPI.login({ email, password, role })
authAPI.registerStudent(data)
authAPI.registerCleaner(data)

// Bookings
bookingAPI.list(params)
bookingAPI.create(data)
bookingAPI.myBookings()
bookingAPI.history()
bookingAPI.assignCleaner(id, cleanerId)
bookingAPI.updateStatus(id, status)

// Cleaner
cleanerAPI.todayTasks()
cleanerAPI.newRequests()
cleanerAPI.allTasks()
cleanerAPI.history()
cleanerAPI.stats()

// Issues
issueAPI.list()
issueAPI.create(data)
issueAPI.updateStatus(id, data)

// Admin
adminAPI.stats()
adminAPI.cleanersList()
adminAPI.toggleCleanerStatus(userId)

// Notifications
notificationAPI.list()
notificationAPI.markRead(id)
notificationAPI.markAllRead()
notificationAPI.unreadCount()

// Profiles
profileAPI.getStudent()
profileAPI.updateStudent(data)
profileAPI.getCleaner()
profileAPI.updateCleaner(data)
```

---

## Additional Resources

- Existing pages for reference: `StudentDashboard.js`, `BookService.js`
- API file: `src/api/api.js`
- Component examples: `src/components/`
- Tailwind classes: https://tailwindcss.com/docs

---

**Good luck with your implementation!** Follow these patterns and you'll have a consistent, professional application. 🚀
