import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { profileAPI } from '../../api/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    block: '',
    room_number: '',
  });

  const menuItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: '📊' },
    { label: 'Book Service', path: '/student/book', icon: '➕' },
    { label: 'My Bookings', path: '/student/bookings', icon: '📋' },
    { label: 'History', path: '/student/history', icon: '📜' },
    { label: 'Profile', path: '/student/profile', icon: '👤' },
    { label: 'Notifications', path: '/student/notifications', icon: '🔔' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getStudent();
      console.log('Profile response:', response.data);
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        phone: response.data.student_profile?.phone || '',
        block: response.data.student_profile?.block || '',
        room_number: response.data.student_profile?.room_number || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error.response?.data || error.message);
      setToast({ message: 'Error loading profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const blockPattern = /^\d{2}[A-Z]$/;
    const roomPattern = /^\d{2}[A-Z]-\d{2}-\d{2}$/;

    if (!blockPattern.test(formData.block)) {
      setToast({
        message: 'Block must be in format: 25E (2 digits + 1 capital letter)',
        type: 'error'
      });
      return;
    }

    if (!roomPattern.test(formData.room_number)) {
      setToast({
        message: 'Room must be in format: 25E-04-10',
        type: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Updating profile with data:', formData);
      const response = await profileAPI.updateStudent(formData);
      console.log('Profile update response:', response.data);
      setToast({ message: 'Profile updated successfully', type: 'success' });
      setEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      const errorData = error.response?.data || {};
      const errorMsg = errorData.block?.[0] ||
        errorData.room_number?.[0] ||
        errorData.phone?.[0] ||
        errorData.name?.[0] ||
        errorData.detail ||
        'Failed to update profile';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DashboardSidebar role="STUDENT" menuItems={menuItems} />

      {/* Main Content - Full Height, Auto Overflow */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

          {/* Page Header */}
          <header className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                  My Profile
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Manage your account information and preferences
                </p>
              </div>

              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              )}
            </div>
          </header>

          {/* Profile Content - Responsive Flex Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">

            {/* Left Column - Profile Card */}
            <aside className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg w-full">

                {/* Profile Avatar */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative group">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-primary-500 via-primary-600 to-blue-700 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105">
                      {profile?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="space-y-2 w-full">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {profile?.name}
                    </h2>
                    <p className="text-sm text-gray-600 break-all">
                      {profile?.email}
                    </p>
                  </div>

                  {/* Role Badge */}
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Student
                  </span>
                </div>

              </div>
            </aside>

            {/* Right Column - Profile Form - Flexible Width */}
            <section className="flex-1 w-full min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg w-full">

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 w-full">

                  {/* Personal Information Section */}
                  <div className="w-full">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      Personal Information
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 sm:mb-6">
                      Update your personal details and contact information
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                      {/* Full Name */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="Enter your full name"
                            required
                          />
                        ) : (
                          <p className="text-base text-gray-900 font-medium py-3 px-4 bg-gray-50 rounded-lg">
                            {profile?.name}
                          </p>
                        )}
                      </div>

                      {/* Email (Read-only) */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={profile?.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            Read-only
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Email cannot be changed for security reasons
                        </p>
                      </div>

                      {/* Student ID (Read-only) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Student ID
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={profile?.student_profile?.student_id}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number
                        </label>
                        {editing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            placeholder="0123456789"
                          />
                        ) : (
                          <p className="text-base py-3 px-4 bg-gray-50 rounded-lg">
                            {profile?.student_profile?.phone ? (
                              <span className="text-gray-900 font-medium">{profile.student_profile.phone}</span>
                            ) : (
                              <span className="text-gray-400 italic text-sm">Not provided</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 w-full"></div>

                  {/* Accommodation Details Section */}
                  <div className="w-full">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      Accommodation Details
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 sm:mb-6">
                      Your hostel block and room information
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                      {/* Block */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Block
                        </label>
                        {editing ? (
                          <div>
                            <input
                              type="text"
                              name="block"
                              value={formData.block}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 uppercase font-mono"
                              placeholder="25E"
                              maxLength="3"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Format: 2 digits + 1 capital letter (e.g., 25E)
                            </p>
                          </div>
                        ) : (
                          <p className="text-base text-gray-900 font-medium font-mono py-3 px-4 bg-gray-50 rounded-lg">
                            {profile?.student_profile?.block}
                          </p>
                        )}
                      </div>

                      {/* Room Number */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Room Number
                        </label>
                        {editing ? (
                          <div>
                            <input
                              type="text"
                              name="room_number"
                              value={formData.room_number}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 font-mono"
                              placeholder="25E-04-10"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Format: Block-Floor-Room (e.g., 25E-04-10)
                            </p>
                          </div>
                        ) : (
                          <p className="text-base text-gray-900 font-medium font-mono py-3 px-4 bg-gray-50 rounded-lg">
                            {profile?.student_profile?.room_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {editing && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-100 w-full">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: profile?.name || '',
                            phone: profile?.student_profile?.phone || '',
                            block: profile?.student_profile?.block || '',
                            room_number: profile?.student_profile?.room_number || '',
                          });
                        }}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
