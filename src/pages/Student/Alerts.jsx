import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { db } from '../../utils/database';
import { Bell, AlertCircle } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    const allAlerts = db.alerts.getAll();
    setAlerts(allAlerts.reverse());
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-500 text-red-900';
      case 'medium': return 'bg-yellow-50 border-yellow-500 text-yellow-900';
      case 'low': return 'bg-blue-50 border-blue-500 text-blue-900';
      default: return 'bg-gray-50 border-gray-500 text-gray-900';
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') {
      return <AlertCircle className="w-6 h-6" />;
    }
    return <Bell className="w-6 h-6" />;
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with important announcements</p>
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
                <div className="p-3 bg-white rounded-lg shadow">
                  {getPriorityIcon(alert.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold">{alert.title}</h3>
                    <span className={`badge ${
                      alert.priority === 'high' ? 'badge-danger' :
                      alert.priority === 'medium' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {alert.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{alert.message}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Posted by {alert.createdBy}</span>
                    <span>•</span>
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No alerts available
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Alerts;
