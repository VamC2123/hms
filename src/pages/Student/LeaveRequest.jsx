import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/database';
import { FileText, Plus, X, Clock, Check, XIcon as XCircle } from 'lucide-react';

const LeaveRequest = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    leaveType: 'Home Visit'
  });

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = () => {
    const userRequests = db.leaveRequests.getByStudent(user.id);
    userRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRequests(userRequests);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fromDate = new Date(formData.fromDate);
    const toDate = new Date(formData.toDate);
    const duration = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    if (duration < 1) {
      alert('Invalid date range!');
      return;
    }

    db.leaveRequests.create({
      studentId: user.id,
      branchId: user.branchId,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      duration,
      reason: formData.reason,
      leaveType: formData.leaveType,
      status: 'pending'
    });

    setShowModal(false);
    setFormData({ fromDate: '', toDate: '', reason: '', leaveType: 'Home Visit' });
    loadRequests();
    alert('Leave request submitted successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      case 'pending': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <Check className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      default: return null;
    }
  };

  const leaveTypes = ['Home Visit', 'Medical', 'Emergency', 'Personal', 'Other'];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
            <p className="text-gray-600 mt-1">Request PG leave and track status</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Request
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Rejected</p>
            <p className="text-3xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-bold text-gray-900">{request.leaveType}</h3>
                      <span className={`badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Submitted on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">From Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(request.fromDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">To Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(request.toDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">
                      {request.duration} day{request.duration !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {request.reason && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Reason:</p>
                  <p className="text-gray-700">{request.reason}</p>
                </div>
              )}

              {request.status === 'approved' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Approved on {new Date(request.approvedAt).toLocaleDateString()} by {request.approvedBy}
                  </p>
                </div>
              )}

              {request.status === 'rejected' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ✗ Rejected on {new Date(request.rejectedAt).toLocaleDateString()} by {request.rejectedBy}
                  </p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⏳ Your request is pending review by management
                  </p>
                </div>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No leave requests submitted yet
            </div>
          )}
        </div>

        {/* New Request Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">New Leave Request</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ fromDate: '', toDate: '', reason: '', leaveType: 'Home Visit' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type
                  </label>
                  <select
                    className="input"
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    required
                  >
                    {leaveTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={formData.fromDate}
                      onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={formData.toDate}
                      onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                      min={formData.fromDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    className="input"
                    rows="3"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Explain the reason for leave..."
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Your request will be reviewed by management. You'll be notified once it's approved or rejected.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn btn-primary flex-1">
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ fromDate: '', toDate: '', reason: '', leaveType: 'Home Visit' });
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default LeaveRequest;
