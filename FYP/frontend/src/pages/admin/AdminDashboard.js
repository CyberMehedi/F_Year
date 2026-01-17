import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { adminAPI, bookingAPI } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [paymentReceipts, setPaymentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Bookings', path: '/admin/bookings', icon: '📅' },
    { label: 'Staff Management', path: '/admin/staff', icon: '👥' },
    { label: 'Maintenance', path: '/admin/maintenance', icon: '🔧' },
    { label: 'Reports', path: '/admin/reports', icon: '📈' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, bookingsResponse, receiptsResponse] = await Promise.all([
        adminAPI.stats(),
        bookingAPI.list({ limit: 5 }),
        adminAPI.paymentReceipts()
      ]);

      setStats(statsResponse.data);
      setRecentBookings(bookingsResponse.data.results || bookingsResponse.data);
      setPaymentReceipts(receiptsResponse.data.receipts || []);
    } catch (error) {
      setToast({
        message: 'Error loading dashboard data',
        type: 'error'
      });
    } finally {
      setLoading(false);
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

      <DashboardSidebar role="ADMIN" menuItems={menuItems} />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">System overview and management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                  <p className="text-4xl font-bold mt-2">{stats?.total_bookings || 0}</p>
                  <p className="text-blue-100 text-sm mt-2">All time</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <span className="text-3xl">📅</span>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Bookings</p>
                  <p className="text-4xl font-bold mt-2">{stats?.pending_bookings || 0}</p>
                  <p className="text-yellow-100 text-sm mt-2">Needs assignment</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <span className="text-3xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Cleaners</p>
                  <p className="text-4xl font-bold mt-2">{stats?.active_cleaners || 0}</p>
                  <p className="text-green-100 text-sm mt-2">Available staff</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <span className="text-3xl">👷</span>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-100 text-sm font-medium">Open Issues</p>
                  <p className="text-4xl font-bold mt-2">{stats?.open_issues || 0}</p>
                  <p className="text-red-100 text-sm mt-2">Requires attention</p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <span className="text-3xl">🔧</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/admin/bookings')}
                className="card hover:shadow-lg transition-all text-center py-6 hover:bg-primary-50"
              >
                <div className="text-4xl mb-2">📋</div>
                <p className="font-semibold text-gray-900">Manage Bookings</p>
                <p className="text-sm text-gray-600 mt-1">Assign & track</p>
              </button>

              <button
                onClick={() => navigate('/admin/staff')}
                className="card hover:shadow-lg transition-all text-center py-6 hover:bg-primary-50"
              >
                <div className="text-4xl mb-2">👥</div>
                <p className="font-semibold text-gray-900">Staff Management</p>
                <p className="text-sm text-gray-600 mt-1">Manage cleaners</p>
              </button>

              <button
                onClick={() => navigate('/admin/maintenance')}
                className="card hover:shadow-lg transition-all text-center py-6 hover:bg-primary-50"
              >
                <div className="text-4xl mb-2">🔧</div>
                <p className="font-semibold text-gray-900">Maintenance</p>
                <p className="text-sm text-gray-600 mt-1">Track issues</p>
              </button>

              <button
                onClick={() => navigate('/admin/reports')}
                className="card hover:shadow-lg transition-all text-center py-6 hover:bg-primary-50"
              >
                <div className="text-4xl mb-2">📊</div>
                <p className="font-semibold text-gray-900">Reports</p>
                <p className="text-sm text-gray-600 mt-1">Analytics</p>
              </button>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">📭</p>
                <p>No bookings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Room</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Cleaner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">#{booking.id}</td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.student_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.student_id}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{booking.room_number}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium">
                            {booking.booking_type === 'DEEP' ? 'Deep Cleaning' : 'Standard'}
                          </span>
                          <div className="text-xs text-gray-500">RM {booking.price}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">{booking.preferred_date}</div>
                          <div className="text-xs text-gray-500">{booking.preferred_time}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {booking.cleaner_name || (
                            <span className="text-gray-400 italic">Not assigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">Today's Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Scheduled</span>
                  <span className="font-bold text-lg">{stats?.today_scheduled || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-bold text-lg text-green-600">{stats?.today_completed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-bold text-lg text-blue-600">{stats?.today_in_progress || 0}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">Revenue</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Today</span>
                  <span className="font-bold text-lg">RM {stats?.today_revenue || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-bold text-lg">RM {stats?.week_revenue || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-bold text-lg text-green-600">RM {stats?.month_revenue || 0}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-bold text-lg">{stats?.total_users || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Students</span>
                  <span className="font-bold text-lg">{stats?.active_students || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-lg text-green-600">
                    {stats?.completion_rate || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipts */}
          <div className="card mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Payment Receipts</h2>
              <span className="text-sm text-gray-600">
                Total: {paymentReceipts.length}
              </span>
            </div>

            {paymentReceipts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">💳</p>
                <p>No payment receipts yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Job ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Cleaner</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Method</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentReceipts.map((receipt) => (
                      <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">#{receipt.booking_id}</td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {receipt.student_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {receipt.student_email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            {receipt.cleaner_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {receipt.cleaner_email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium">
                            {receipt.booking_type === 'DEEP' ? 'Deep Cleaning' : 'Standard'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Block {receipt.block}, Room {receipt.room_number}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-green-600">
                            RM {receipt.amount}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            receipt.payment_method === 'ONLINE' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {receipt.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {new Date(receipt.payment_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(receipt.payment_date).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {receipt.payment_method === 'ONLINE' && receipt.payment_receipt ? (
                            <button
                              onClick={() => window.open(receipt.payment_receipt, '_blank')}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline"
                            >
                              View Receipt →
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm italic">
                              No receipt (Offline Payment)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
