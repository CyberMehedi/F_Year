import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { cleanerAPI, bookingAPI } from '../../api/api';

const TodayTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/cleaner/dashboard', icon: '📊' },
    { label: 'New Requests', path: '/cleaner/new-requests', icon: '🔔' },
    { label: "Today's Tasks", path: '/cleaner/today', icon: '📅' },
    { label: 'All Tasks', path: '/cleaner/all-tasks', icon: '📋' },
    { label: 'My History', path: '/cleaner/history', icon: '📜' },
    { label: 'Report Issues', path: '/cleaner/issues', icon: '⚠️' },
    { label: 'Statistics', path: '/cleaner/stats', icon: '📈' },
  ];

  useEffect(() => {
    fetchTodayTasks();
  }, []);

  const fetchTodayTasks = async () => {
    try {
      const response = await cleanerAPI.todayTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      setToast({ message: 'Error loading tasks', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingStatus(taskId);
    try {
      await bookingAPI.updateStatus(taskId, newStatus);
      setToast({ message: 'Status updated successfully', type: 'success' });
      fetchTodayTasks();
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: 'Failed to update status', type: 'error' });
    } finally {
      setUpdatingStatus(null);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Today's Tasks</h1>
            <p className="text-gray-600 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </header>

          {tasks.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tasks Today</h3>
              <p className="text-gray-500">You don't have any tasks scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tasks.map((task) => (
                <div key={task.id} className="card hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(task.urgency_level)}`}>
                        {task.urgency_level}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                          disabled={updatingStatus === task.id}
                          className="btn btn-sm btn-primary"
                        >
                          {updatingStatus === task.id ? 'Updating...' : 'Start'}
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                          disabled={updatingStatus === task.id}
                          className="btn btn-sm btn-success"
                        >
                          {updatingStatus === task.id ? 'Updating...' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {task.booking_type.replace('_', ' ')}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm">
                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div>
                              <span className="font-medium text-gray-700 block">Student</span>
                              <span className="text-gray-600">{task.student_name}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <span className="font-medium text-gray-700 block">Email</span>
                              <span className="text-gray-600 break-all">{task.student_email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm">
                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <div>
                              <span className="font-medium text-gray-700 block">Location</span>
                              <span className="text-gray-600">Block {task.block}, Room {task.room_number}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <span className="font-medium text-gray-700 block">Time</span>
                              <span className="text-gray-600">{task.preferred_time}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {task.special_instructions && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="font-semibold text-blue-900 mb-1 text-sm">Special Instructions</h4>
                          <p className="text-sm text-blue-800">{task.special_instructions}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Task Timeline</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS' || task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-600">Assigned</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${task.status === 'IN_PROGRESS' || task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-600">In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-600">Completed</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">Price</span>
                          <span className="text-lg font-bold text-primary-600">RM {task.price}</span>
                        </div>
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

export default TodayTasks;
