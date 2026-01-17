# AIU Hostel Cleaning Service System - Frontend

React-based frontend for the Albukhary International University Hostel Cleaning Service Management System.

## Features

- **Modern UI**: Built with React and Tailwind CSS
- **Role-Based Access**: Separate dashboards for Students, Cleaners, and Admins
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Notifications and booking status tracking
- **Secure Authentication**: JWT token-based authentication

## Tech Stack

- React 18.2
- React Router 6.20
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Backend API running on http://localhost:8000

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── api/
│   └── api.js                 # API helper functions
├── components/
│   ├── Header.js              # Main navigation header
│   ├── Footer.js              # Footer component
│   ├── ProtectedRoute.js      # Route protection
│   ├── DashboardSidebar.js    # Dashboard sidebar
│   ├── LoadingSpinner.js      # Loading indicator
│   ├── Toast.js               # Toast notifications
│   └── Modal.js               # Modal dialog
├── context/
│   └── AuthContext.js         # Authentication context
├── pages/
│   ├── Home.js                # Landing page
│   ├── Services.js            # Services information
│   ├── About.js               # About page
│   ├── auth/
│   │   ├── Login.js           # Login page
│   │   └── Register.js        # Registration page
│   ├── student/
│   │   ├── StudentDashboard.js    # Student dashboard
│   │   ├── BookService.js         # Booking form
│   │   ├── MyBookings.js          # Bookings list
│   │   ├── History.js             # Booking history
│   │   ├── Profile.js             # User profile
│   │   └── Notifications.js       # Notifications
│   ├── cleaner/
│   │   ├── CleanerDashboard.js    # Cleaner dashboard
│   │   ├── NewRequests.js         # New task requests
│   │   ├── TodayTasks.js          # Today's tasks
│   │   ├── AllTasks.js            # All tasks
│   │   ├── MyHistory.js           # Work history
│   │   ├── Issues.js              # Issue reporting
│   │   └── Stats.js               # Statistics
│   └── admin/
│       ├── AdminDashboard.js      # Admin dashboard
│       ├── BookingsManagement.js  # Manage all bookings
│       ├── StaffManagement.js     # Manage cleaners
│       ├── Maintenance.js         # Maintenance issues
│       └── Reports.js             # Reports and analytics
├── App.js                     # Main app component with routing
├── index.js                   # Entry point
└── index.css                  # Global styles

```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Environment Configuration

The API base URL is configured in `src/api/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

Update this if your backend runs on a different URL.

## User Roles

### Student
- View dashboard with booking statistics
- Book cleaning services (Standard or Deep Cleaning)
- View and manage bookings
- View booking history
- Update profile
- Receive notifications

### Cleaner
- View assigned tasks
- See today's schedule
- Update task status
- Report maintenance issues
- View work statistics

### Admin
- Manage all bookings
- Assign cleaners to tasks
- Manage cleaner accounts
- Handle maintenance issues
- Generate reports

## Key Features Implementation

### Authentication
- Email and password login
- Role-based registration
- JWT token management
- Automatic token refresh
- Protected routes

### Booking System
- Service type selection (Deep/Standard)
- Date and time scheduling (30-min slots)
- Room validation (format: 25E-04-10)
- Urgency level selection
- Special instructions
- Real-time price calculation

### Notifications
- Booking confirmations
- Cleaner assignments
- Status updates
- Issue reports

## Form Validation

### Student Registration
- Student ID: `AIU\d{8}` (e.g., AIU23102325)
- Block: `\d{2}[A-Z]` (e.g., 25E)
- Room: `\d{2}[A-Z]-\d{2}-\d{2}` (e.g., 25E-04-10)

### Booking Rules
- Date cannot be in the past
- Time slots: 08:00-23:00 in 30-minute increments
- Date-time combination must be in the future

## Styling

The application uses Tailwind CSS with custom configurations:

- Primary color: Blue (`primary-600`)
- Responsive breakpoints
- Custom animations (fade-in, slide-up, slide-down)
- Card components with hover effects
- Button variants (primary, secondary, danger)

## Development Status

### ✅ Completed
- Authentication system
- Public pages (Home, Services, About)
- Student dashboard
- Booking form
- API integration
- Protected routes
- Responsive design

### 🚧 To Be Completed
The following components are created as placeholders and need full implementation:
- Student: MyBookings, History, Profile, Notifications
- Cleaner: All pages (Dashboard, Tasks, Issues, Stats)
- Admin: All pages (Dashboard, Bookings, Staff, Maintenance, Reports)

## Implementation Guide for Remaining Pages

Each placeholder page should follow this structure:

1. Import necessary dependencies
2. Use DashboardSidebar component
3. Fetch data from API using hooks
4. Display data in tables/cards
5. Add action buttons with modals
6. Handle loading and error states
7. Show success/error toasts

Example pattern:
```javascript
import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { apiFunction } from '../../api/api';

const PageName = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiFunction();
      setData(response.data);
    } catch (error) {
      setToast({ message: 'Error loading data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ... render JSX
};
```

## API Integration

All API calls are centralized in `src/api/api.js`:

- Authentication: `authAPI`
- Bookings: `bookingAPI`
- Cleaner: `cleanerAPI`
- Issues: `issueAPI`
- Admin: `adminAPI`
- Notifications: `notificationAPI`
- Profiles: `profileAPI`

## Testing

To test the application:

1. Ensure backend is running
2. Register as a student
3. Login and explore student features
4. Use Django admin to create cleaner/admin accounts
5. Test different role dashboards

## Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Common Issues

### CORS Errors
Ensure Django CORS settings allow `http://localhost:3000`

### API Connection Failed
Check that backend is running on `http://localhost:8000`

### Token Expired
The app automatically refreshes tokens. If issues persist, clear localStorage and login again.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When adding new pages:
1. Follow the existing component structure
2. Use Tailwind CSS classes
3. Implement proper error handling
4. Add loading states
5. Ensure responsive design
6. Test with different screen sizes

## License

This project is part of a Final Year Project for Albukhary International University.
