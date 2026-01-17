import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { issueAPI, cleanerAPI } from '../../api/api';

const ReportIssues = () => {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    booking: '',
    issue_type: 'OTHER',
    description: '',
    photo_url: '',
  });

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
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await cleanerAPI.allTasks();
      // Filter to show only assigned, in-progress, and completed tasks
      const relevantBookings = response.data.filter(
        booking => ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)
      );
      setBookings(relevantBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setToast({ message: 'Error loading your tasks', type: 'error' });
    } finally {
      setLoading(false);
    }
  };



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.booking) {
      setToast({ message: 'Please select a task/booking', type: 'error' });
      return;
    }

    if (!formData.description) {
      setToast({ message: 'Please provide a description', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      await issueAPI.create(formData);
      setToast({ message: 'Issue reported successfully', type: 'success' });
      setFormData({
        booking: '',
        issue_type: 'OTHER',
        description: '',
        photo_url: '',
      });
    } catch (error) {
      console.error('Error reporting issue:', error);
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.response?.data?.detail
        || 'Failed to report issue';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DashboardSidebar role="CLEANER" menuItems={menuItems} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Report Issue</h1>
            <p className="text-gray-600 mt-1">Report maintenance or equipment issues</p>
          </header>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Booking Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Select Task/Booking *
                      </label>
                      <div className="relative">
                        <select
                          name="booking"
                          value={formData.booking}
                          onChange={handleChange}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer hover:border-primary-400"
                          required
                        >
                          <option value="">Select a task...</option>
                          {bookings.map(booking => (
                            <option key={booking.id} value={booking.id}>
                              #{booking.id} - {booking.block} {booking.room_number} - {booking.booking_type} ({new Date(booking.preferred_date).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {bookings.length === 0 && (
                        <p className="mt-2 text-sm text-amber-600">
                          You don't have any assigned tasks. Issues must be reported for specific tasks.
                        </p>
                      )}
                    </div>

                    {/* Issue Type */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Issue Type *
                      </label>
                      <div className="relative">
                        <select
                          name="issue_type"
                          value={formData.issue_type}
                          onChange={handleChange}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer hover:border-primary-400"
                          required
                        >
                          <option value="PLUMBING">🚰 Plumbing</option>
                          <option value="ELECTRICAL">⚡ Electrical</option>
                          <option value="DAMAGE">💥 Damage</option>
                          <option value="OTHER">📝 Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Issue Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="8"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Please provide a detailed description of the issue you encountered...&#10;&#10;Include:&#10;• What happened&#10;• When it occurred&#10;• Location/room details&#10;• Any relevant circumstances"
                      required
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        Be as specific as possible to help resolve the issue quickly
                      </p>
                      <span className="text-xs text-gray-400">
                        {formData.description.length} characters
                      </span>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting Report...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Submit Issue Report
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        booking: '',
                        issue_type: 'EQUIPMENT_MALFUNCTION',
                        description: '',
                        photo_url: '',
                      })}
                      className="sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Clear Form
                    </button>
                  </div>

                </form>
              </div>
            </>
          )}

          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reporting Guidelines
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Report issues immediately when encountered
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Provide detailed, specific descriptions
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Include location and time information
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Track status updates in your dashboard
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2 text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Priority Issues
              </h3>
              <div className="text-sm text-orange-800 space-y-2">
                <p className="font-medium">For urgent safety hazards:</p>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Submit report immediately through this form
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Contact admin directly for immediate action
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Do not continue work if unsafe
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ReportIssues;
