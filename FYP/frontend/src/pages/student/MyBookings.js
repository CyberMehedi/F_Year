import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import PaymentSection from '../../components/PaymentSection';
import { bookingAPI } from '../../api/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const menuItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: '📊' },
    { label: 'Book Service', path: '/student/book', icon: '➕' },
    { label: 'My Bookings', path: '/student/bookings', icon: '📋' },
    { label: 'History', path: '/student/history', icon: '📜' },
    { label: 'Profile', path: '/student/profile', icon: '👤' },
    { label: 'Notifications', path: '/student/notifications', icon: '🔔' },
  ];

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.myBookings();
      const activeBookings = response.data.filter(
        b => !['CANCELLED'].includes(b.status) || (b.status === 'COMPLETED' && b.payment_status === 'PENDING')
      );
      setBookings(activeBookings);
    } catch (error) {
      if (loading) {
        setToast({ message: 'Error loading bookings', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 20000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.updateStatus(bookingId, 'CANCELLED');
      setToast({ message: 'Booking cancelled successfully', type: 'success' });
      fetchBookings();
      setModalOpen(false);
    } catch (error) {
      setToast({ message: 'Failed to cancel booking', type: 'error' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      WAITING_FOR_CLEANER: 'bg-orange-100 text-orange-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = statusFilter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

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
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-2">View and manage your active bookings</p>
            </div>
            <button
              onClick={() => window.location.href = '/student/book'}
              className="btn btn-primary"
            >
              + New Booking
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="card mb-6">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {status === 'ALL' ? 'All Bookings' : status.replace('_', ' ')}
                  <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                    {status === 'ALL'
                      ? bookings.length
                      : bookings.filter(b => b.status === status).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'ALL'
                  ? "You haven't made any bookings yet"
                  : `No bookings with status: ${statusFilter}`
                }
              </p>
              <button
                onClick={() => window.location.href = '/student/book'}
                className="btn btn-primary"
              >
                Book Your First Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">
                          {booking.booking_type === 'DEEP' ? '🧹' : '✨'}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {booking.booking_type === 'DEEP' ? 'Deep Cleaning' : 'Standard Cleaning'}
                          </h3>
                          <p className="text-sm text-gray-600">Booking #{booking.id}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Room</p>
                          <p className="font-semibold">{booking.room_number}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date & Time</p>
                          <p className="font-semibold">{booking.preferred_date}</p>
                          <p className="text-xs text-gray-500">{booking.preferred_time}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Price</p>
                          <p className="font-semibold text-primary-600">RM {booking.price}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cleaner</p>
                          <p className="font-semibold">
                            {booking.cleaner_name || (
                              <span className="text-gray-400 italic">Not assigned</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {booking.special_instructions && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Special Instructions:</p>
                          <p className="text-sm text-gray-800">{booking.special_instructions}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="btn btn-secondary btn-sm"
                        >
                          View Details
                        </button>
                        {['PENDING', 'ASSIGNED'].includes(booking.status) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {modalOpen && selectedBooking && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Booking Details">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-xl font-bold">
                  {selectedBooking.booking_type === 'DEEP' ? 'Deep Cleaning' : 'Standard Cleaning'}
                </h3>
                <p className="text-sm text-gray-600">Booking #{selectedBooking.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                {selectedBooking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Block</p>
                <p className="font-semibold">{selectedBooking.block}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room Number</p>
                <p className="font-semibold">{selectedBooking.room_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preferred Date</p>
                <p className="font-semibold">{selectedBooking.preferred_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preferred Time</p>
                <p className="font-semibold">{selectedBooking.preferred_time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgency</p>
                <p className="font-semibold capitalize">{selectedBooking.urgency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-semibold text-primary-600">RM {selectedBooking.price}</p>
              </div>
            </div>

            {selectedBooking.status === 'WAITING_FOR_CLEANER' ? (
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <svg className="animate-pulse w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold">Waiting for Cleaner Acceptance</p>
                </div>
                <p className="text-sm text-orange-800">Your booking is visible to all cleaners. You'll be notified once a cleaner accepts.</p>
              </div>
            ) : selectedBooking.cleaner_name ? (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Assigned Cleaner</p>
                <p className="font-semibold text-gray-900">{selectedBooking.cleaner_name}</p>
              </div>
            ) : null}

            {selectedBooking.special_instructions && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Special Instructions</p>
                <p className="text-gray-800">{selectedBooking.special_instructions}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Created on {new Date(selectedBooking.created_at).toLocaleString()}
              </p>
            </div>

            {/* Payment Section */}
            <PaymentSection 
              booking={selectedBooking} 
              onPaymentComplete={(updatedBooking) => {
                setSelectedBooking(updatedBooking);
                fetchBookings();
                setToast({ message: 'Payment completed successfully', type: 'success' });
              }}
            />

            {['PENDING', 'ASSIGNED'].includes(selectedBooking.status) && (
              <button
                onClick={() => handleCancelBooking(selectedBooking.id)}
                className="w-full btn bg-red-600 hover:bg-red-700 text-white"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyBookings;
