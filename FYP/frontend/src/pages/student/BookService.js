import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import Toast from '../../components/Toast';
import { bookingAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const BookService = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    booking_type: 'STANDARD',
    preferred_date: '',
    preferred_time: '08:00',
    urgency_level: 'NORMAL',
    block: user?.student_profile?.block || '',
    room_number: user?.student_profile?.room_number || '',
    special_instructions: '',
  });
  const [errors, setErrors] = useState({});

  const menuItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { label: 'Book Service', path: '/student/book', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> },
    { label: 'My Bookings', path: '/student/bookings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { label: 'History', path: '/student/history', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Profile', path: '/student/profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { label: 'Notifications', path: '/student/notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
  ];

  // Generate time slots (08:00 to 23:00 in 30-minute increments)
  const timeSlots = [];
  for (let hour = 8; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!/^\d{2}[A-Z]$/.test(formData.block)) {
      newErrors.block = 'Block must be in format: 25E';
    }

    if (!/^\d{2}[A-Z]-\d{2}-\d{2}$/.test(formData.room_number)) {
      newErrors.room_number = 'Room number must be in format: 25E-04-10';
    }

    // Check if date is not in the past
    const selectedDate = new Date(formData.preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      newErrors.preferred_date = 'Date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await bookingAPI.create(formData);
      setToast({ message: 'Booking created successfully!', type: 'success' });

      setTimeout(() => {
        navigate('/student/bookings');
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.preferred_time?.[0] ||
        error.response?.data?.detail ||
        'Failed to create booking';
      setToast({ message: errorMsg, type: 'error' });
      setLoading(false);
    }
  };

  const servicePrice = formData.booking_type === 'DEEP' ? 30 : 20;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DashboardSidebar role="STUDENT" menuItems={menuItems} />

      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Book a Cleaning Service</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type */}
              <div className="card">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Select Service Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <label className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${formData.booking_type === 'STANDARD' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <input
                      type="radio"
                      name="booking_type"
                      value="STANDARD"
                      checked={formData.booking_type === 'STANDARD'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                        <span className="text-base sm:text-lg font-bold">Standard Cleaning</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary-600">RM 20</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Essential room cleaning and tidying for regular upkeep.</p>
                      <p className="text-xs text-yellow-600 font-medium">Bathroom not included.</p>
                    </div>
                  </label>

                  <label className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${formData.booking_type === 'DEEP' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <input
                      type="radio"
                      name="booking_type"
                      value="DEEP"
                      checked={formData.booking_type === 'DEEP'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                        <span className="text-base sm:text-lg font-bold">Deep Cleaning</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary-600">RM 30</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Thorough room cleaning with enhanced detailing.</p>
                      <p className="text-xs text-green-600 font-medium">Includes bathroom.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Date and Time */}
              <div className="card">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Select Date & Time</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="label">Preferred Date</label>
                    <input
                      type="date"
                      name="preferred_date"
                      value={formData.preferred_date}
                      onChange={handleChange}
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {errors.preferred_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.preferred_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Preferred Time</label>
                    <select
                      name="preferred_time"
                      value={formData.preferred_time}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Room Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="label">Block</label>
                    <input
                      type="text"
                      name="block"
                      value={formData.block}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="25E"
                      required
                    />
                    {errors.block && (
                      <p className="text-red-500 text-sm mt-1">{errors.block}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Room Number</label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="25E-04-10"
                      required
                    />
                    {errors.room_number && (
                      <p className="text-red-500 text-sm mt-1">{errors.room_number}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="card">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Additional Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Urgency Level</label>
                    <select
                      name="urgency_level"
                      value={formData.urgency_level}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Special Instructions (Optional)</label>
                    <textarea
                      name="special_instructions"
                      value={formData.special_instructions}
                      onChange={handleChange}
                      className="input-field"
                      rows="4"
                      placeholder="Any special requests or areas that need extra attention..."
                    />
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="card bg-primary-50 border-2 border-primary-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-1">Total Price</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {formData.booking_type === 'DEEP' ? 'Deep Cleaning' : 'Standard Cleaning'} Service
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary-600">
                    RM {servicePrice}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/student/dashboard')}
                  className="btn btn-secondary flex-1 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1 w-full sm:w-auto"
                >
                  {loading ? 'Creating Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;
