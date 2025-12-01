import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/database';
import { MessageSquare, Plus, X, Clock, CheckCircle } from 'lucide-react';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (user) {
      loadComplaints();
    }
  }, [user]);

  const loadComplaints = () => {
    const userComplaints = db.complaints.getByStudent(user.id);
    userComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setComplaints(userComplaints);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    db.complaints.create({
      studentId: user.id,
      branchId: user.branchId,
      roomNumber: user.roomNumber,
      ...formData,
      status: 'pending'
    });

    setShowModal(false);
    setFormData({ type: '', description: '', priority: 'medium' });
    loadComplaints();
    alert('Complaint submitted successfully!');
  };

  const complaintTypes = [
    'AC not working',
    'Water supply issue',
    'Electricity problem',
    'Cleanliness issue',
    'Furniture repair needed',
    'Internet connectivity',
    'Plumbing issue',
    'Pest control',
    'Other'
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
            <p className="text-gray-600 mt-1">Raise and track your complaints</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Raise Complaint
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-900">{complaints.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {complaints.filter(c => c.status === 'pending').length}
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
                  {complaints.filter(c => c.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.map(complaint => (
            <div key={complaint.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-gray-900">{complaint.type}</h3>
                    {complaint.status === 'pending' ? (
                      <span className="badge badge-warning flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    ) : (
                      <span className="badge badge-success flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </span>
                    )}
                    <span className={`badge ${
                      complaint.priority === 'high' ? 'badge-danger' :
                      complaint.priority === 'medium' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{complaint.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Room {complaint.roomNumber}</span>
                    <span>•</span>
                    <span>{new Date(complaint.createdAt).toLocaleString()}</span>
                  </div>
                  {complaint.status === 'resolved' && complaint.resolvedAt && (
                    <p className="text-sm text-green-600 mt-2">
                      Resolved on {new Date(complaint.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {complaints.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No complaints raised yet
            </div>
          )}
        </div>

        {/* Raise Complaint Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Raise Complaint</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ type: '', description: '', priority: 'medium' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint Type
                  </label>
                  <select
                    className="input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="">Select type...</option>
                    {complaintTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="input"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="input"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Room: {user?.roomNumber} • Floor: {user?.floor}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn btn-primary flex-1">
                    Submit Complaint
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ type: '', description: '', priority: 'medium' });
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

export default Complaints;
