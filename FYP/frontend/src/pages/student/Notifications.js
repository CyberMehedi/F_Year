import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { notificationAPI } from '../../api/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: '📊' },
    { label: 'Book Service', path: '/student/book', icon: '➕' },
    { label: 'My Bookings', path: '/student/bookings', icon: '📋' },
    { label: 'History', path: '/student/history', icon: '📜' },
    { label: 'Profile', path: '/student/profile', icon: '👤' },
    { label: 'Notifications', path: '/student/notifications', icon: '🔔' },
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.list();
      // Ensure we always have an array
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setNotifications(data);
    } catch (error) {
      setToast({ message: 'Error loading notifications', type: 'error' });
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      setToast({ message: 'Failed to mark as read', type: 'error' });
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setToast({ message: 'All notifications marked as read', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to mark all as read', type: 'error' });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DashboardSidebar role="STUDENT" menuItems={menuItems} />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                {unreadCount > 0 ? (
                  <span>You have <span className="font-semibold text-primary-600">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}</span>
                ) : (
                  'All caught up!'
                )}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn btn-secondary"
              >
                Mark All as Read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">We'll notify you when something important happens</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`card transition-all hover:shadow-lg ${!notification.is_read ? 'border-l-4 border-primary-600 bg-primary-50' : 'opacity-75'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {notification.is_read ? '📭' : '📬'}
                        </span>
                        <h3 className="font-bold text-gray-900">{notification.title}</h3>
                        {!notification.is_read && (
                          <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3 ml-11">{notification.message}</p>
                      <p className="text-xs text-gray-500 ml-11">
                        {new Date(notification.created_at).toLocaleString('en-MY', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
