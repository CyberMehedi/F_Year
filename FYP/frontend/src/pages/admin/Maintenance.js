import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { issueAPI } from '../../api/api';

const Maintenance = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Bookings', path: '/admin/bookings', icon: '📅' },
    { label: 'Staff Management', path: '/admin/staff', icon: '👥' },
    { label: 'Maintenance', path: '/admin/maintenance', icon: '🔧' },
    { label: 'Reports', path: '/admin/reports', icon: '📈' },
  ];

  const statusOptions = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await issueAPI.list();
      const issuesData = Array.isArray(response.data)
        ? response.data
        : (response.data.results || []);
      setIssues(issuesData);
    } catch (error) {
      console.error('Error fetching issues:', error);
      setToast({ message: 'Error loading issues', type: 'error' });
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      await issueAPI.updateStatus(issueId, { status: newStatus });
      setToast({ message: 'Status updated successfully', type: 'success' });
      fetchIssues();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getIssueTypeIcon = (type) => {
    const icons = {
      EQUIPMENT_MALFUNCTION: '🔧',
      CLEANLINESS_CONCERN: '🧹',
      SAFETY_HAZARD: '⚠️',
      MAINTENANCE_NEEDED: '🔨',
      SUPPLY_SHORTAGE: '📦',
      OTHER: '📝',
    };
    return icons[type] || '📝';
  };

  const filteredIssues = issues.filter(issue =>
    filterStatus === 'ALL' || issue.status === filterStatus
  );

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
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Issues</h1>
            <p className="text-gray-600 mt-1">View and manage reported maintenance issues</p>
          </header>

          <div className="mb-6">
            <div className="flex gap-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filterStatus === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  {status} ({issues.filter(i => status === 'ALL' || i.status === status).length})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {statusOptions.slice(1).map(status => (
              <div key={status} className="card">
                <div className="text-sm text-gray-600 mb-1">{status}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {issues.filter(i => i.status === status).length}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getIssueTypeIcon(issue.issue_type)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {issue.issue_type.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-500">Issue #{issue.id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600"><span className="font-medium">Reported by:</span> {issue.reported_by_name}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {new Date(issue.created_at).toLocaleDateString()} at {new Date(issue.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><span className="font-medium">Related Booking:</span> #{issue.booking}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 font-medium mb-1">Description:</p>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setSelectedIssue(issue); setShowDetailModal(true); }} className="btn btn-primary text-sm">
                    View Details
                  </button>
                  {issue.status === 'OPEN' && (
                    <button onClick={() => handleStatusUpdate(issue.id, 'IN_PROGRESS')} className="btn bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm">
                      Start Working
                    </button>
                  )}
                  {issue.status === 'IN_PROGRESS' && (
                    <button onClick={() => handleStatusUpdate(issue.id, 'RESOLVED')} className="btn bg-green-100 hover:bg-green-200 text-green-700 text-sm">
                      Mark Resolved
                    </button>
                  )}
                  {issue.status === 'RESOLVED' && (
                    <button onClick={() => handleStatusUpdate(issue.id, 'CLOSED')} className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm">
                      Close Issue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredIssues.length === 0 && (
            <div className="card text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
              <p className="mt-1 text-sm text-gray-500">No maintenance issues match your filter.</p>
            </div>
          )}
        </div>
      </main>

      {showDetailModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getIssueTypeIcon(selectedIssue.issue_type)}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedIssue.issue_type.replace(/_/g, ' ')}</h3>
                  <p className="text-sm text-gray-500">Issue #{selectedIssue.id}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedIssue.status)}`}>
                  {selectedIssue.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Issue Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700">Reported by:</span> {selectedIssue.reported_by_name}</p>
                  <p><span className="font-medium text-gray-700">Email:</span> {selectedIssue.reported_by_email}</p>
                  <p><span className="font-medium text-gray-700">Date:</span> {new Date(selectedIssue.created_at).toLocaleString()}</p>
                  <p><span className="font-medium text-gray-700">Related Booking:</span> #{selectedIssue.booking}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Description</h4>
                <p className="text-sm text-blue-800">{selectedIssue.description}</p>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedIssue.status === 'OPEN' && (
                  <button onClick={() => handleStatusUpdate(selectedIssue.id, 'IN_PROGRESS')} className="flex-1 btn bg-blue-600 hover:bg-blue-700 text-white">
                    Start Working
                  </button>
                )}
                {selectedIssue.status === 'IN_PROGRESS' && (
                  <button onClick={() => handleStatusUpdate(selectedIssue.id, 'RESOLVED')} className="flex-1 btn bg-green-600 hover:bg-green-700 text-white">
                    Mark as Resolved
                  </button>
                )}
                {selectedIssue.status === 'RESOLVED' && (
                  <button onClick={() => handleStatusUpdate(selectedIssue.id, 'CLOSED')} className="flex-1 btn bg-gray-600 hover:bg-gray-700 text-white">
                    Close Issue
                  </button>
                )}
                <button onClick={() => setShowDetailModal(false)} className="btn bg-gray-100 hover:bg-gray-200 text-gray-700">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
