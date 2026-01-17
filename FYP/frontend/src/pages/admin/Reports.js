import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { bookingAPI, adminAPI, issueAPI } from '../../api/api';

const Reports = () => {
  const [bookings, setBookings] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Bookings', path: '/admin/bookings', icon: '📅' },
    { label: 'Staff Management', path: '/admin/staff', icon: '👥' },
    { label: 'Maintenance', path: '/admin/maintenance', icon: '🔧' },
    { label: 'Reports', path: '/admin/reports', icon: '📈' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, cleanersRes, issuesRes] = await Promise.all([
        bookingAPI.list(),
        adminAPI.cleanersList(),
        issueAPI.list(),
      ]);
      const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.results || []);
      const cleanersData = Array.isArray(cleanersRes.data) ? cleanersRes.data : (cleanersRes.data.results || []);
      const issuesData = Array.isArray(issuesRes.data) ? issuesRes.data : (issuesRes.data.results || []);
      setBookings(bookingsData);
      setCleaners(cleanersData);
      setIssues(issuesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ message: 'Error loading reports', type: 'error' });
      setBookings([]);
      setCleaners([]);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = () => {
    return bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + parseFloat(b.price || 0), 0);
  };

  const getCleanerWorkload = () => {
    const workload = {};
    cleaners.forEach(cleaner => {
      const tasks = bookings.filter(b => b.assigned_cleaner === cleaner.id);
      workload[cleaner.name] = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        pending: tasks.filter(t => t.status === 'ASSIGNED').length,
      };
    });
    return workload;
  };

  const getBookingTrends = () => {
    const trends = {
      STANDARD_CLEANING: bookings.filter(b => b.booking_type === 'STANDARD_CLEANING').length,
      DEEP_CLEANING: bookings.filter(b => b.booking_type === 'DEEP_CLEANING').length,
    };
    return trends;
  };

  const getStatusBreakdown = () => {
    return {
      PENDING: bookings.filter(b => b.status === 'PENDING').length,
      ASSIGNED: bookings.filter(b => b.status === 'ASSIGNED').length,
      IN_PROGRESS: bookings.filter(b => b.status === 'IN_PROGRESS').length,
      COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
      CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
    };
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Student', 'Room', 'Type', 'Date', 'Time', 'Status', 'Cleaner', 'Price'];
    const rows = bookings.map(b => [
      b.id,
      b.student_name,
      `${b.block} - ${b.room_number}`,
      b.booking_type,
      b.preferred_date,
      b.preferred_time,
      b.status,
      b.assigned_cleaner_name || 'N/A',
      b.price,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setToast({ message: 'Report exported successfully', type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const revenue = calculateRevenue();
  const workload = getCleanerWorkload();
  const trends = getBookingTrends();
  const statusBreakdown = getStatusBreakdown();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DashboardSidebar role="ADMIN" menuItems={menuItems} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
            </div>
            <button onClick={exportToCSV} className="btn btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </header>

          {/* Financial Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="text-sm text-green-600 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-green-900">RM {revenue.toFixed(2)}</div>
              </div>
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="text-sm text-blue-600 mb-1">Total Bookings</div>
                <div className="text-2xl font-bold text-blue-900">{bookings.length}</div>
              </div>
              <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="text-sm text-purple-600 mb-1">Completed</div>
                <div className="text-2xl font-bold text-purple-900">{statusBreakdown.COMPLETED}</div>
              </div>
              <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="text-sm text-orange-600 mb-1">Avg. Price</div>
                <div className="text-2xl font-bold text-orange-900">
                  RM {bookings.length > 0 ? (revenue / statusBreakdown.COMPLETED || 0).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Status Breakdown */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Status Distribution</h2>
            <div className="card">
              <div className="space-y-4">
                {Object.entries(statusBreakdown).map(([status, count]) => {
                  const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                  const colors = {
                    PENDING: 'bg-yellow-500',
                    ASSIGNED: 'bg-blue-500',
                    IN_PROGRESS: 'bg-purple-500',
                    COMPLETED: 'bg-green-500',
                    CANCELLED: 'bg-red-500',
                  };
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{status}</span>
                        <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${colors[status]}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Service Type Analysis */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Service Type Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Booking Types</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Standard Cleaning</span>
                      <span className="text-gray-600">{trends.STANDARD_CLEANING} bookings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(trends.STANDARD_CLEANING / bookings.length) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Deep Cleaning</span>
                      <span className="text-gray-600">{trends.DEEP_CLEANING} bookings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: `${(trends.DEEP_CLEANING / bookings.length) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Maintenance Issues</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Issues</span>
                    <span className="text-sm font-semibold text-gray-900">{issues.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Open</span>
                    <span className="text-sm font-semibold text-yellow-600">{issues.filter(i => i.status === 'OPEN').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="text-sm font-semibold text-blue-600">{issues.filter(i => i.status === 'IN_PROGRESS').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Resolved</span>
                    <span className="text-sm font-semibold text-green-600">{issues.filter(i => i.status === 'RESOLVED').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cleaner Performance */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cleaner Performance</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(workload).map(([name, data]) => (
                      <tr key={name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{data.completed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{data.inProgress}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{data.pending}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : '0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {Object.keys(workload).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No cleaner performance data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Reports;
