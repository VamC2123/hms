import React, { useState, useEffect } from 'react';
import ManagementLayout from '../../components/ManagementLayout';
import { db } from '../../utils/database';
import { Bell, Plus, X, Send } from 'lucide-react';

const AlertManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    const allAlerts = db.alerts.getAll();
    setAlerts(allAlerts.reverse());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    db.alerts.create({
      ...formData,
      createdBy: 'admin'
    });

    setShowModal(false);
    setFormData({ title: '', message: '', priority: 'medium' });
    loadAlerts();
    alert('Alert sent to all students!');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-500';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
            <p className="text-gray-600 mt-1">Send notifications to all students</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Send Alert
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Alerts</p>
            <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">High Priority</p>
            <p className="text-3xl font-bold text-red-600">
              {alerts.filter(a => a.priority === 'high').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">This Week</p>
            <p className="text-3xl font-bold text-blue-600">
              {alerts.filter(a => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(a.createdAt) > weekAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`card border-l-4 ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-lg">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{alert.title}</h3>
                    <span className={`badge ${getPriorityColor(alert.priority)}`}>
                      {alert.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{alert.message}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Sent by {alert.createdBy}</span>
                    <span>•</span>
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No alerts sent yet
            </div>
          )}
        </div>

        {/* Send Alert Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Send Alert</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ title: '', message: '', priority: 'medium' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter alert title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    className="input"
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter alert message..."
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

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    This alert will be sent to all students across all branches.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center">
                    <Send className="w-4 h-4 mr-2" />
                    Send Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ title: '', message: '', priority: 'medium' });
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
    </ManagementLayout>
  );
};

export default AlertManagement;
