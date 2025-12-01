import React, { useState, useEffect } from 'react';
import ManagementLayout from '../../components/ManagementLayout';
import { db } from '../../utils/database';
import {
  Building2,
  Users,
  Bed,
  DollarSign,
  MessageSquare,
  Bell,
  BarChart3,
  Search,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Dashboard = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    roomsByShare: { 2: { total: 0, occupied: 0 }, 3: { total: 0, occupied: 0 }, 4: { total: 0, occupied: 0 }, 5: { total: 0, occupied: 0 } },
    totalPaid: 0,
    totalPending: 0,
    pendingComplaints: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    loadData();
  }, [selectedBranch]);

  const loadData = () => {
    const allBranches = db.branches.getAll();
    setBranches(allBranches);

    const students = selectedBranch === 'all' 
      ? db.students.getAll() 
      : db.students.getByBranch(selectedBranch);

    const rooms = selectedBranch === 'all'
      ? db.rooms.getAll()
      : db.rooms.getByBranch(selectedBranch);

    const complaints = selectedBranch === 'all'
      ? db.complaints.getPending()
      : db.complaints.getPending().filter(c => c.branchId === selectedBranch);

    // Calculate room statistics
    const roomsByShare = { 2: { total: 0, occupied: 0 }, 3: { total: 0, occupied: 0 }, 4: { total: 0, occupied: 0 }, 5: { total: 0, occupied: 0 } };
    let occupiedRooms = 0;

    rooms.forEach(room => {
      if (roomsByShare[room.shareType]) {
        roomsByShare[room.shareType].total++;
        if (room.occupiedBeds > 0) {
          roomsByShare[room.shareType].occupied++;
        }
      }
      if (room.occupiedBeds > 0) {
        occupiedRooms++;
      }
    });

    // Calculate payment statistics
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const allPayments = db.payments.getAll();
    const currentMonthPayments = allPayments.filter(
      p => p.month === currentMonth && p.year === currentYear
    );

    let totalPaid = 0;
    if (selectedBranch === 'all') {
      totalPaid = currentMonthPayments.reduce((sum, p) => sum + p.totalAmount, 0);
    } else {
      totalPaid = currentMonthPayments
        .filter(p => p.branchId === selectedBranch)
        .reduce((sum, p) => sum + p.totalAmount, 0);
    }

    // Calculate pending payments
    const settings = db.settings.get();
    const studentsWithoutPayment = students.filter(student => {
      const hasPayment = currentMonthPayments.some(p => p.studentId === student.id);
      return !hasPayment;
    });

    let totalPending = 0;
    studentsWithoutPayment.forEach(student => {
      const roomFee = settings.fees[`${student.shareType}Share`] || 4000;
      const messFee = settings.fees.messFee || 2000;
      totalPending += roomFee + messFee;
    });

    setStats({
      totalStudents: students.length,
      totalRooms: rooms.length,
      occupiedRooms,
      vacantRooms: rooms.length - occupiedRooms,
      roomsByShare,
      totalPaid,
      totalPending,
      pendingComplaints: complaints.length
    });

    // Load recent alerts
    setRecentAlerts(db.alerts.getRecent(3));
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const results = db.students.search(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color, trend }) => (
    <div className="card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subValue && (
            <p className="text-sm text-gray-500 mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-sm">
          {trend.up ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={trend.up ? 'text-green-600' : 'text-red-600'}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <ManagementLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of hostel management system</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="input"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats.totalStudents}
            color="bg-blue-500"
          />
          <StatCard
            icon={Bed}
            label="Rooms"
            value={stats.totalRooms}
            subValue={`${stats.occupiedRooms} Occupied, ${stats.vacantRooms} Vacant`}
            color="bg-purple-500"
          />
          <StatCard
            icon={DollarSign}
            label="Payments This Month"
            value={`₹${stats.totalPaid.toLocaleString()}`}
            subValue={`Pending: ₹${stats.totalPending.toLocaleString()}`}
            color="bg-green-500"
          />
          <StatCard
            icon={MessageSquare}
            label="Pending Complaints"
            value={stats.pendingComplaints}
            color="bg-red-500"
          />
        </div>

        {/* Room Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Room Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[2, 3, 4, 5].map(share => (
              <div key={share} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {share}-Share Rooms
                  </span>
                  <Bed className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.roomsByShare[share].occupied}/{stats.roomsByShare[share].total}
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{
                      width: `${stats.roomsByShare[share].total > 0 
                        ? (stats.roomsByShare[share].occupied / stats.roomsByShare[share].total) * 100 
                        : 0}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.roomsByShare[share].total - stats.roomsByShare[share].occupied} vacant
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Student Search */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Student Search</h2>
          <div className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search by name, phone, or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map(student => {
                const branch = db.branches.getById(student.branchId);
                return (
                  <div key={student.id} className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">
                        {student.phoneNumber} • {student.admissionNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{branch?.name}</p>
                      <p className="text-sm text-gray-600">
                        Room {student.roomNumber} • Floor {student.floor}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions & Recent Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <MessageSquare className="w-4 h-4 inline mr-2 text-red-500" />
                View Pending Complaints ({stats.pendingComplaints})
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <DollarSign className="w-4 h-4 inline mr-2 text-green-500" />
                Manage Payments
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Users className="w-4 h-4 inline mr-2 text-blue-500" />
                Add New Student
              </button>
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
                  <div key={alert.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <h3 className="font-medium text-gray-900 text-sm">{alert.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent alerts</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ManagementLayout>
  );
};

export default Dashboard;
