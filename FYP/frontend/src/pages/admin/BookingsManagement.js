import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { bookingAPI, adminAPI } from '../../api/api';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Bookings', path: '/admin/bookings', icon: '📅' },
    { label: 'Staff Management', path: '/admin/staff', icon: '👥' },
    { label: 'Maintenance', path: '/admin/maintenance', icon: '🔧' },
    { label: 'Reports', path: '/admin/reports', icon: '📈' },
  ];

  const statusOptions = ['ALL', 'PENDING', 'WAITING_FOR_CLEANER', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    fetchBookings();
    fetchCleaners();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.list();
      const bookingsData = Array.isArray(response.data)
        ? response.data
        : (response.data.results || []);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setToast({ message: 'Error loading bookings', type: 'error' });
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCleaners = async () => {
    try {
      const response = await adminAPI.availableCleaners();
      // Response already includes only active cleaners with task counts
      setCleaners(response.data);
    } catch (error) {
      console.error('Error fetching cleaners:', error);
    }
  };

  const handleAssignCleaner = async () => {
    if (!selectedCleaner) {
      setToast({ message: 'Please select a cleaner', type: 'error' });
      return;
    }

    try {
      await bookingAPI.assignCleaner(selectedBooking.id, selectedCleaner);
      setToast({ message: 'Cleaner assigned successfully', type: 'success' });
      setShowAssignModal(false);
      setSelectedBooking(null);
      setSelectedCleaner('');
      fetchBookings();
    } catch (error) {
      console.error('Error assigning cleaner:', error);
      setToast({ message: 'Failed to assign cleaner', type: 'error' });
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateStatus(bookingId, newStatus);
      setToast({ message: 'Status updated successfully', type: 'success' });
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      WAITING_FOR_CLEANER: 'bg-orange-100 text-orange-800 border-orange-200',
      ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'ALL' || booking.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      booking.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.block?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

      <DashboardSidebar role="ADMIN" menuItems={menuItems} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600 mt-1">View and manage all cleaning service bookings</p>
          </header>

          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by student, room, or block..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {statusOptions.slice(1).map(status => (
              <div key={status} className="card">
                <div className="text-sm text-gray-600 mb-1">{status}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === status).length}
                </div>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.student_name}</div>
                        <div className="text-sm text-gray-500">{booking.student_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.block} - {booking.room_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.booking_type.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-500">RM {booking.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(booking.preferred_date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{booking.preferred_time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {booking.assigned_cleaner_name || <span className="text-gray-400 italic">Not assigned</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {booking.payment_receipt_url ? (
                          <button
                            onClick={() => window.open(booking.payment_receipt_url, '_blank')}
                            className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                          >
                            View →
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">No receipt</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                          <button
                            onClick={() => { setSelectedBooking(booking); setShowAssignModal(true); }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {booking.assigned_cleaner_name ? 'Reassign' : 'Assign'}
                          </button>
                        )}
                        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                          <select value={booking.status} onChange={(e) => handleStatusUpdate(booking.id, e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1">
                            <option value={booking.status}>{booking.status}</option>
                            {booking.status === 'PENDING' && <option value="CANCELLED">CANCELLED</option>}
                            {booking.status === 'ASSIGNED' && <><option value="IN_PROGRESS">IN_PROGRESS</option><option value="CANCELLED">CANCELLED</option></>}
                            {booking.status === 'IN_PROGRESS' && <option value="COMPLETED">COMPLETED</option>}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedBooking?.assigned_cleaner_name ? 'Reassign Cleaner' : 'Assign Cleaner'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Booking Details:</p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p><span className="font-medium">Student:</span> {selectedBooking?.student_name}</p>
                <p><span className="font-medium">Room:</span> {selectedBooking?.block} - {selectedBooking?.room_number}</p>
                <p><span className="font-medium">Type:</span> {selectedBooking?.booking_type.replace('_', ' ')}</p>
                <p><span className="font-medium">Date:</span> {new Date(selectedBooking?.preferred_date).toLocaleDateString()} at {selectedBooking?.preferred_time}</p>
                {selectedBooking?.assigned_cleaner_name && (
                  <p className="mt-2 pt-2 border-t border-gray-200">
                    <span className="font-medium">Current Cleaner:</span> {selectedBooking.assigned_cleaner_name}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Cleaner</label>
              <p className="text-xs text-gray-500 mb-3">Cleaners are sorted by availability (least busy first)</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cleaners.map(cleaner => (
                  <div
                    key={cleaner.id}
                    onClick={() => setSelectedCleaner(cleaner.id)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedCleaner === cleaner.id
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{cleaner.name}</p>
                        <p className="text-xs text-gray-500">{cleaner.email}</p>
                        {cleaner.phone && <p className="text-xs text-gray-500">📞 {cleaner.phone}</p>}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Today: {cleaner.today_tasks}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Active: {cleaner.active_tasks}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {cleaners.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No active cleaners available</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleAssignCleaner} className="flex-1 btn btn-primary">Assign</button>
              <button onClick={() => { setShowAssignModal(false); setSelectedBooking(null); setSelectedCleaner(''); }} className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;
