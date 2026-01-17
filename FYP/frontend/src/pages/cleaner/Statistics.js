import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { cleanerAPI } from '../../api/api';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

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
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await cleanerAPI.stats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setToast({ message: 'Error loading statistics', type: 'error' });
    } finally {
      setLoading(false);
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
    <div className="flex min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DashboardSidebar role="CLEANER" menuItems={menuItems} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Performance Statistics</h1>
            <p className="text-gray-600 mt-1">Track your cleaning performance and achievements</p>
          </header>

          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-3xl font-bold text-primary-600 mt-2">{stats?.completed_today || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.completed_week || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats?.completed_month || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Task Type Distribution */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Task Type Distribution</h2>
            {stats?.type_distribution && stats.type_distribution.length > 0 ? (
              <div className="space-y-4">
                {stats.type_distribution.map((type) => (
                  <div key={type.booking_type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {type.booking_type.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{type.count} tasks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full"
                        style={{
                          width: `${(type.count / stats.type_distribution.reduce((sum, t) => sum + t.count, 0)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No task data available yet
              </div>
            )}
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Issues</h3>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-orange-600">{stats?.pending_issues || 0}</span>
                <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mt-2">Issues reported by you</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Rating</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-yellow-600">
                    {stats?.completed_month > 0 ? '⭐' : '—'}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats?.completed_month > 50 ? 'Excellent' :
                      stats?.completed_month > 30 ? 'Very Good' :
                        stats?.completed_month > 10 ? 'Good' :
                          stats?.completed_month > 0 ? 'Getting Started' : 'New'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Based on monthly completions</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Statistics;
