import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { bookingAPI } from '../../api/api';

const History = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: '📊' },
    { label: 'Book Service', path: '/student/book', icon: '➕' },
    { label: 'My Bookings', path: '/student/bookings', icon: '📋' },
    { label: 'History', path: '/student/history', icon: '📜' },
    { label: 'Profile', path: '/student/profile', icon: '👤' },
    { label: 'Notifications', path: '/student/notifications', icon: '🔔' },
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await bookingAPI.history();
      setBookings(response.data);
    } catch (error) {
      setToast({ message: 'Error loading history', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = bookings.filter(booking =>
    booking.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.booking_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpent = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + parseFloat(b.price), 0);

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
            <p className="text-gray-600 mt-2">View your past cleaning service bookings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <p className="text-green-100 text-sm">Total Completed</p>
              <p className="text-4xl font-bold mt-2">
                {bookings.filter(b => b.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
              <p className="text-red-100 text-sm">Cancelled</p>
              <p className="text-4xl font-bold mt-2">
                {bookings.filter(b => b.status === 'CANCELLED').length}
              </p>
            </div>
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <p className="text-blue-100 text-sm">Total Spent</p>
              <p className="text-4xl font-bold mt-2">RM {totalSpent.toFixed(2)}</p>
            </div>
          </div>

          {/* Search */}
          <div className="card mb-6">
            <input
              type="text"
              placeholder="Search by room, block, or service type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* History List */}
          {filteredBookings.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'No results found' : 'No history yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Your completed and cancelled bookings will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Room</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cleaner</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium">{booking.preferred_date}</div>
                        <div className="text-xs text-gray-500">{booking.preferred_time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {booking.booking_type === 'DEEP' ? '🧹' : '✨'}
                          </span>
                          <span className="font-medium">
                            {booking.booking_type === 'DEEP' ? 'Deep Cleaning' : 'Standard'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium">{booking.room_number}</div>
                        <div className="text-xs text-gray-500">Block {booking.block}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {booking.cleaner_name || (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-primary-600">RM {booking.price}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {booking.status === 'COMPLETED' && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.payment_status === 'PAID' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.payment_status === 'PAID' ? 'Paid' : 'Pending'}
                            {booking.payment_method && ` (${booking.payment_method})`}
                          </span>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <span className="text-gray-400 text-xs">N/A</span>
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
  );
};

export default History;
