import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  CreditCard,
  MessageSquare,
  BarChart3,
  Bell,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/profile', icon: User, label: 'Profile' },
    { path: '/student/payment', icon: CreditCard, label: 'Payments' },
    { path: '/student/complaints', icon: MessageSquare, label: 'Complaints' },
    { path: '/student/polls', icon: BarChart3, label: 'Polls' },
    { path: '/student/alerts', icon: Bell, label: 'Alerts' },
    { path: '/student/leave-request', icon: FileText, label: 'Leave Request' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo & User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              {sidebarOpen && (
                <span className="text-xl font-bold text-gray-800">HMS Student</span>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
            
            {sidebarOpen && user && (
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.phoneNumber}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 mb-1 transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 border-t"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
