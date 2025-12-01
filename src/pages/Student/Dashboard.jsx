import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/database';
import { Home, CreditCard, MessageSquare, FileText, Bell, User } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [branch, setBranch] = useState(null);
  const [stats, setStats] = useState({
    pendingPayments: 0,
    complaints: 0,
    leaveRequests: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    const branchData = db.branches.getById(user.branchId);
    setBranch(branchData);

    // Calculate pending payments
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const payments = db.payments.getByStudent(user.id);
    const currentMonthPayment = payments.find(
      p => p.month === currentMonth && p.year === currentYear
    );

    // Get complaints
    const complaints = db.complaints.getByStudent(user.id);
    const pendingComplaints = complaints.filter(c => c.status === 'pending').length;

    // Get leave requests
    const leaveRequests = db.leaveRequests.getByStudent(user.id);
    const pendingLeaveRequests = leaveRequests.filter(r => r.status === 'pending').length;

    setStats({
      pendingPayments: currentMonthPayment ? 0 : 1,
      complaints: pendingComplaints,
      leaveRequests: pendingLeaveRequests
    });

    // Get recent alerts
    setRecentAlerts(db.alerts.getRecent(5));
  };

  const QuickAccessCard = ({ icon: Icon, label, value, color, to }) => (
    <div className={`card-hover cursor-pointer ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-primary" />
      </div>
    </div>
  );

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center space-x-4">
            <img
              src={user?.photoUrl}
              alt={user?.name}
              className="w-20 h-20 rounded-full border-4 border-white"
            />
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-blue-100 mt-1">
                Room {user?.roomNumber} • Floor {user?.floor} • {branch?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAccessCard
            icon={CreditCard}
            label="Pending Payments"
            value={stats.pendingPayments}
            color={stats.pendingPayments > 0 ? 'bg-red-50' : 'bg-green-50'}
          />
          <QuickAccessCard
            icon={MessageSquare}
            label="Active Complaints"
            value={stats.complaints}
            color="bg-yellow-50"
          />
          <QuickAccessCard
            icon={FileText}
            label="Leave Requests"
            value={stats.leaveRequests}
            color="bg-blue-50"
          />
        </div>

        {/* Room Details */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Room Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Room Number</p>
              <p className="text-lg font-bold text-gray-900">{user?.roomNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Floor</p>
              <p className="text-lg font-bold text-gray-900">{user?.floor}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Room Type</p>
              <p className="text-lg font-bold text-gray-900">{user?.shareType}-Share</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Branch</p>
              <p className="text-lg font-bold text-gray-900">{branch?.name}</p>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Recent Alerts
          </h2>
          <div className="space-y-3">
            {recentAlerts.length > 0 ? (
              recentAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.priority === 'high'
                      ? 'bg-red-50 border-red-500'
                      : alert.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 text-sm">{alert.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent alerts</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/student/profile" className="card-hover text-center">
            <User className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-medium text-gray-900">Profile</p>
          </a>
          <a href="/student/payment" className="card-hover text-center">
            <CreditCard className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-medium text-gray-900">Payments</p>
          </a>
          <a href="/student/complaints" className="card-hover text-center">
            <MessageSquare className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-medium text-gray-900">Complaints</p>
          </a>
          <a href="/student/leave-request" className="card-hover text-center">
            <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-medium text-gray-900">Leave Request</p>
          </a>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
