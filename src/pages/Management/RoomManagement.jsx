import React, { useState, useEffect } from 'react';
import ManagementLayout from '../../components/ManagementLayout';
import { db } from '../../utils/database';
import { Bed, Filter } from 'lucide-react';

const RoomManagement = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedShare, setSelectedShare] = useState('all');
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    vacant: 0,
    occupancyRate: 0
  });

  useEffect(() => {
    loadData();
  }, [selectedBranch, selectedShare]);

  const loadData = () => {
    setBranches(db.branches.getAll());
    
    let filteredRooms = selectedBranch === 'all'
      ? db.rooms.getAll()
      : db.rooms.getByBranch(selectedBranch);

    if (selectedShare !== 'all') {
      filteredRooms = filteredRooms.filter(r => r.shareType === parseInt(selectedShare));
    }

    // Sort by floor and room number
    filteredRooms.sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.roomNumber.localeCompare(b.roomNumber);
    });

    setRooms(filteredRooms);

    // Calculate stats
    const occupied = filteredRooms.filter(r => r.occupiedBeds > 0).length;
    const total = filteredRooms.length;
    const vacant = total - occupied;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    setStats({ total, occupied, vacant, occupancyRate });
  };

  const getRoomStatus = (room) => {
    if (room.occupiedBeds === 0) return 'vacant';
    if (room.occupiedBeds < room.totalBeds) return 'partial';
    return 'full';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'vacant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'vacant': return 'border-green-500';
      case 'partial': return 'border-yellow-500';
      case 'full': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {});

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage room occupancy</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Occupied</p>
            <p className="text-3xl font-bold text-red-600">{stats.occupied}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Vacant</p>
            <p className="text-3xl font-bold text-green-600">{stats.vacant}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Occupancy Rate</p>
            <p className="text-3xl font-bold text-blue-600">{stats.occupancyRate}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <select
                className="input"
                value={selectedShare}
                onChange={(e) => setSelectedShare(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="2">2-Share</option>
                <option value="3">3-Share</option>
                <option value="4">4-Share</option>
                <option value="5">5-Share</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rooms by Floor */}
        {Object.keys(roomsByFloor).sort().map(floor => (
          <div key={floor} className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Floor {floor}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {roomsByFloor[floor].map(room => {
                const status = getRoomStatus(room);
                const branch = db.branches.getById(room.branchId);
                
                return (
                  <div
                    key={room.id}
                    className={`border-2 ${getStatusBorderColor(status)} rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{room.roomNumber}</span>
                      <Bed className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className={`badge ${getStatusColor(status)} mb-2`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{branch?.name}</p>
                    <p className="text-xs text-gray-600">
                      {room.shareType}-Share
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      {room.occupiedBeds}/{room.totalBeds} Beds
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="card text-center py-8 text-gray-500">
            No rooms found with the selected filters
          </div>
        )}

        {/* Legend */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Legend</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Vacant (0 beds occupied)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Partial (Some beds occupied)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Full (All beds occupied)</span>
            </div>
          </div>
        </div>
      </div>
    </ManagementLayout>
  );
};

export default RoomManagement;
