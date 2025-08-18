import React, { useState } from 'react';
import { FileText, Plus, Filter, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { WorkReport } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const WorkReports: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'assigned',
    taskId: '',
    hoursSpent: '',
    date: new Date().toISOString().split('T')[0]
  });

  const mockReports: WorkReport[] = [
    {
      id: '1',
      employeeId: '1',
      employeeName: 'John Doe',
      taskId: '1',
      title: 'Project Documentation Progress',
      description: 'Completed the user guide section and started working on technical specifications. Encountered some challenges with API documentation formatting.',
      type: 'assigned',
      date: '2024-12-18',
      hoursSpent: 6.5,
      status: 'submitted',
      approvedBy: 'Department Manager'
    },
    {
      id: '2',
      employeeId: '1',
      employeeName: 'John Doe',
      title: 'Bug Fix - Login Issue',
      description: 'Fixed critical login bug reported by QA team. Issue was related to session timeout handling.',
      type: 'unplanned',
      date: '2024-12-17',
      hoursSpent: 3.0,
      status: 'approved',
      approvedBy: 'Team Lead'
    },
    {
      id: '3',
      employeeId: '2',
      employeeName: 'Jane Smith',
      taskId: '2',
      title: 'Code Review Completion',
      description: 'Reviewed authentication module changes, provided feedback and approved merge requests.',
      type: 'assigned',
      date: '2024-12-17',
      hoursSpent: 2.0,
      status: 'approved',
      approvedBy: 'Department Manager'
    },
    {
      id: '4',
      employeeId: '3',
      employeeName: 'Mike Johnson',
      title: 'Client Meeting Support',
      description: 'Attended client presentation meeting and provided technical support during demo.',
      type: 'unplanned',
      date: '2024-12-16',
      hoursSpent: 4.0,
      status: 'submitted'
    },
    {
      id: '5',
      employeeId: '1',
      employeeName: 'John Doe',
      title: 'Database Optimization',
      description: 'Optimized slow queries in the reporting module. Performance improved by 40%.',
      type: 'unplanned',
      date: '2024-12-15',
      hoursSpent: 5.5,
      status: 'rejected',
      feedback: 'Please provide more details about the specific optimizations made.'
    }
  ];

  const getFilteredReports = () => {
    let filtered = mockReports;

    // Filter by user role
    if (user?.role === 'employee') {
      filtered = filtered.filter(report => report.employeeId === user.id);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type === filterType);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredReports = getFilteredReports();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Report submitted:', formData);
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      type: 'assigned',
      taskId: '',
      hoursSpent: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'submitted':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'draft':
        return <FileText className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'unplanned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const totalHours = filteredReports.reduce((sum, report) => sum + report.hoursSpent, 0);
  const approvedReports = filteredReports.filter(report => report.status === 'approved').length;
  const pendingReports = filteredReports.filter(report => report.status === 'submitted').length;
  const thisWeekReports = filteredReports.filter(report => {
    const reportDate = new Date(report.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return reportDate >= weekAgo;
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Work Reports</h2>
        {user?.role === 'employee' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Report</span>
          </button>
        )}
      </div>

      {/* Report Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredReports.length}</div>
            <div className="text-sm text-blue-800">Total Reports</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{approvedReports}</div>
            <div className="text-sm text-green-800">Approved</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pendingReports}</div>
            <div className="text-sm text-yellow-800">Pending Review</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</div>
            <div className="text-sm text-purple-800">Total Hours</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="assigned">Assigned Tasks</option>
            <option value="unplanned">Unplanned Work</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(report.status)}
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(report.type)}`}>
                    {report.type === 'assigned' ? 'Assigned Task' : 'Unplanned Work'}
                  </span>
                </div>
                
                {user?.role !== 'employee' && (
                  <div className="text-sm text-gray-500 mb-2">
                    Submitted by: {report.employeeName}
                  </div>
                )}
                
                <p className="text-gray-600 mb-3">{report.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{report.hoursSpent} hours</span>
                  </div>
                  {report.approvedBy && (
                    <div className="text-green-600">
                      Approved by: {report.approvedBy}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
                <div className="text-right text-sm">
                  <div className="font-medium text-gray-900">{report.hoursSpent}h</div>
                  <div className="text-gray-500">logged</div>
                </div>
              </div>
            </div>

            {/* Feedback section for rejected reports */}
            {report.status === 'rejected' && report.feedback && (
              <div className="border-t border-gray-200 pt-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Feedback</span>
                  </div>
                  <p className="text-sm text-red-700">{report.feedback}</p>
                </div>
              </div>
            )}

            {/* Actions for managers/HR */}
            {(user?.role === 'manager' || user?.role === 'hr') && report.status === 'submitted' && (
              <div className="border-t border-gray-200 pt-4 flex justify-end space-x-3">
                <button className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors">
                  Approve
                </button>
                <button className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No work reports found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Work Report</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter report title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="assigned">Assigned Task</option>
                  <option value="unplanned">Unplanned Work</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={formData.hoursSpent}
                    onChange={(e) => setFormData({ ...formData, hoursSpent: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the work performed, challenges faced, and results achieved..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Saved as draft:', formData);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkReports;