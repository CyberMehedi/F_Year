import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { cleanerAPI, bookingAPI } from '../../api/api';

const NewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/cleaner/dashboard', icon: '📊' },
    { label: 'New Requests', path: '/cleaner/new-requests', icon: '🔔' },
    { label: "Today's Tasks", path: '/cleaner/today', icon: '📅' },
    { label: 'All Tasks', path: '/cleaner/all-tasks', icon: '📋' },
    { label: 'My History', path: '/cleaner/history', icon: '📜' },
    { label: 'Report Issues', path: '/cleaner/issues', icon: '⚠️' },
    { label: 'Statistics', path: '/cleaner/stats', icon: '📈' },
  ];

  const fetchNewRequests = async () => {
    try {
      const response = await cleanerAPI.newRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching new requests:', error);
      if (loading) {
        setToast({ message: 'Error loading new requests', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewRequests();
    const interval = setInterval(fetchNewRequests, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcceptTask = async (taskId) => {
    setActionLoading(true);
    try {
      await bookingAPI.acceptBooking(taskId);
      setToast({ message: 'Task accepted successfully! You can now see it in your assigned tasks.', type: 'success' });
      fetchNewRequests();
    } catch (error) {
      console.error('Error accepting task:', error);
      const errorMsg = error.response?.data?.error || 'Failed to accept task';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DashboardSidebar role="CLEANER" menuItems={menuItems} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">New Requests</h1>
            <p className="text-gray-600 mt-1">View available requests and be the first to accept!</p>
          </header>

          {requests.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No New Requests</h3>
              <p className="text-gray-500">No new requests available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {requests.map((request) => (
                <div key={request.id} className="card hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(request.urgency_level)}`}>
                        {request.urgency_level} Priority
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 flex items-center gap-1">
                        <svg className="animate-pulse w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Waiting
                      </span>
                    </div>
                    <button
                      onClick={() => handleAcceptTask(request.id)}
                      disabled={actionLoading}
                      className="btn btn-primary"
                    >
                      {actionLoading ? 'Accepting...' : 'Accept Task'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {request.booking_type.replace('_', ' ')}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium text-gray-700">Student:</span>
                          <span className="text-gray-600">{request.student_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium text-gray-700">Location:</span>
                          <span className="text-gray-600">Block {request.block}, Room {request.room_number}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-700">Date:</span>
                          <span className="text-gray-600">{new Date(request.preferred_date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-700">Time:</span>
                          <span className="text-gray-600">{request.preferred_time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-700">Price:</span>
                          <span className="text-gray-600">RM {request.price}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {request.special_instructions && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Special Instructions
                          </h4>
                          <p className="text-sm text-blue-800">{request.special_instructions}</p>
                        </div>
                      )}

                      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {request.student_email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default NewRequests;
