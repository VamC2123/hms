import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Bed,
  CreditCard,
  MessageSquare,
  BarChart3,
  Bell,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const ManagementLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/management/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/management/branches', icon: Building2, label: 'Branches' },
    { path: '/management/students', icon: Users, label: 'Students' },
    { path: '/management/rooms', icon: Bed, label: 'Rooms' },
    { path: '/management/payments', icon: CreditCard, label: 'Payments' },
    { path: '/management/complaints', icon: MessageSquare, label: 'Complaints' },
    { path: '/management/polls', icon: BarChart3, label: 'Polls' },
    { path: '/management/alerts', icon: Bell, label: 'Alerts' },
    { path: '/management/leave-requests', icon: FileText, label: 'Leave Requests' }
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
          {/* Logo */}
          <div className="p-4 border-b flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <Building2 className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold text-gray-800">HMS Admin</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
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

export default ManagementLayout;
