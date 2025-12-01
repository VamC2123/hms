import React, { useState, useEffect } from 'react';
import ManagementLayout from '../../components/ManagementLayout';
import { db } from '../../utils/database';
import { FileText, Check, X as XIcon, Clock } from 'lucide-react';

const LeaveRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = () => {
    let allRequests = db.leaveRequests.getAll();

    if (filter !== 'all') {
      allRequests = allRequests.filter(r => r.status === filter);
    }

    // Sort by date (newest first)
    allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Enrich with student and branch data
    const enrichedRequests = allRequests.map(request => ({
      ...request,
      student: db.students.getById(request.studentId),
      branch: db.branches.getById(request.branchId)
    }));

    setRequests(enrichedRequests);
  };

  const handleApprove = (requestId) => {
    if (confirm('Approve this leave request?')) {
      db.leaveRequests.update(requestId, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin'
      });
      loadRequests();
    }
  };

  const handleReject = (requestId) => {
    if (confirm('Reject this leave request?')) {
      db.leaveRequests.update(requestId, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'admin'
      });
      loadRequests();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      case 'pending': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Request Management</h1>
            <p className="text-gray-600 mt-1">Approve or reject student leave requests</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {db.leaveRequests.getPending().length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {db.leaveRequests.getAll().filter(r => r.status === 'approved').length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {db.leaveRequests.getAll().filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">
                  {db.leaveRequests.getAll().length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="input max-w-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={request.student?.photoUrl}
                    alt={request.student?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-gray-900">{request.student?.name}</h3>
                      <span className={`badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                      <p><strong>Branch:</strong> {request.branch?.name}</p>
                      <p><strong>Room:</strong> {request.student?.roomNumber}</p>
                      <p><strong>Phone:</strong> {request.student?.phoneNumber}</p>
                      <p><strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <p><strong>From:</strong> {new Date(request.fromDate).toLocaleDateString()}</p>
                        <p><strong>To:</strong> {new Date(request.toDate).toLocaleDateString()}</p>
                        <p><strong>Duration:</strong> {request.duration} days</p>
                        <p><strong>Type:</strong> {request.leaveType || 'General'}</p>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Reason:</p>
                        <p className="text-gray-700">{request.reason}</p>
                      </div>
                    )}

                    {request.status === 'approved' && (
                      <p className="text-sm text-green-600">
                        Approved on {new Date(request.approvedAt).toLocaleString()} by {request.approvedBy}
                      </p>
                    )}
                    {request.status === 'rejected' && (
                      <p className="text-sm text-red-600">
                        Rejected on {new Date(request.rejectedAt).toLocaleString()} by {request.rejectedBy}
                      </p>
                    )}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="btn btn-success flex items-center whitespace-nowrap"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="btn btn-danger flex items-center whitespace-nowrap"
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No leave requests found
            </div>
          )}
        </div>
      </div>
    </ManagementLayout>
  );
};

export default LeaveRequestManagement;
