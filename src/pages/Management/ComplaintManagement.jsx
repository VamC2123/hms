import React, { useState, useEffect } from 'react';
import ManagementLayout from '../../components/ManagementLayout';
import { db } from '../../utils/database';
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    loadData();
  }, [filter, selectedBranch]);

  const loadData = () => {
    setBranches(db.branches.getAll());
    let allComplaints = db.complaints.getAll();

    // Filter by status
    if (filter !== 'all') {
      allComplaints = allComplaints.filter(c => c.status === filter);
    }

    // Filter by branch
    if (selectedBranch !== 'all') {
      allComplaints = allComplaints.filter(c => c.branchId === selectedBranch);
    }

    // Sort by creation date (newest first)
    allComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Enrich with student and branch data
    const enrichedComplaints = allComplaints.map(complaint => ({
      ...complaint,
      student: db.students.getById(complaint.studentId),
      branch: db.branches.getById(complaint.branchId)
    }));

    setComplaints(enrichedComplaints);
  };

  const handleResolve = (complaintId) => {
    if (confirm('Mark this complaint as resolved?')) {
      db.complaints.update(complaintId, { 
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
      loadData();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
            <p className="text-gray-600 mt-1">Track and resolve student complaints</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {db.complaints.getPending().length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-600">
                  {db.complaints.getAll().filter(c => c.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">
                  {db.complaints.getAll().length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                className="input"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.map(complaint => (
            <div key={complaint.id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={complaint.student?.photoUrl}
                    alt={complaint.student?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-gray-900">{complaint.student?.name}</h3>
                      <span className={`badge ${getPriorityColor(complaint.priority)} flex items-center space-x-1`}>
                        {getPriorityIcon(complaint.priority)}
                        <span>{complaint.priority}</span>
                      </span>
                      {complaint.status === 'resolved' && (
                        <span className="badge badge-success">Resolved</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                      <p><strong>Room:</strong> {complaint.roomNumber}</p>
                      <p><strong>Branch:</strong> {complaint.branch?.name}</p>
                      <p><strong>Type:</strong> {complaint.type}</p>
                      <p><strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-gray-700">{complaint.description}</p>
                    {complaint.resolvedAt && (
                      <p className="text-sm text-green-600 mt-2">
                        Resolved on {new Date(complaint.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                {complaint.status === 'pending' && (
                  <button
                    onClick={() => handleResolve(complaint.id)}
                    className="btn btn-success flex items-center whitespace-nowrap ml-4"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}

          {complaints.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No complaints found
            </div>
          )}
        </div>
      </div>
    </ManagementLayout>
  );
};

export default ComplaintManagement;
