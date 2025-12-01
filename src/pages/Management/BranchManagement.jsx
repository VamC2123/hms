import React, { useState, useEffect } from 'react';
import ManagementLayout from '../../components/ManagementLayout';
import { db, generateRoomNumber } from '../../utils/database';
import { Building2, Plus, Edit2, Trash2, X } from 'lucide-react';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    floors: 2,
    roomsPerFloor: 8,
    contact: ''
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = () => {
    setBranches(db.branches.getAll());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingBranch) {
      db.branches.update(editingBranch.id, formData);
    } else {
      const newBranch = db.branches.create(formData);
      
      // Create rooms for the new branch
      const shareTypes = [2, 3, 4, 5];
      let roomCounter = 0;
      
      for (let floor = 1; floor <= formData.floors; floor++) {
        for (let room = 0; room < Math.floor(formData.roomsPerFloor / 4); room++) {
          shareTypes.forEach(shareType => {
            const roomNumber = generateRoomNumber(floor, roomCounter++);
            db.rooms.create({
              branchId: newBranch.id,
              roomNumber,
              floor,
              shareType,
              totalBeds: shareType,
              occupiedBeds: 0,
              status: 'available'
            });
          });
        }
      }
    }

    setShowModal(false);
    setEditingBranch(null);
    setFormData({ name: '', address: '', floors: 2, roomsPerFloor: 8, contact: '' });
    loadBranches();
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      floors: branch.floors,
      roomsPerFloor: branch.roomsPerFloor,
      contact: branch.contact
    });
    setShowModal(true);
  };

  const handleDelete = (branchId) => {
    if (confirm('Are you sure you want to delete this branch? This will also delete all associated data.')) {
      // Delete associated data
      const students = db.students.getByBranch(branchId);
      students.forEach(student => db.students.delete(student.id));
      
      const rooms = db.rooms.getByBranch(branchId);
      rooms.forEach(room => db.rooms.delete(room.id));
      
      db.branches.delete(branchId);
      loadBranches();
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
            <p className="text-gray-600 mt-1">Manage hostel branches</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Branch
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(branch => {
            const rooms = db.rooms.getByBranch(branch.id);
            const students = db.students.getByBranch(branch.id);
            const occupiedRooms = rooms.filter(r => r.occupiedBeds > 0).length;

            return (
              <div key={branch.id} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{branch.name}</h3>
                      <p className="text-sm text-gray-600">{branch.contact}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{branch.address}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Floors</p>
                    <p className="text-xl font-bold text-gray-900">{branch.floors}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Rooms</p>
                    <p className="text-xl font-bold text-gray-900">{rooms.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Students</p>
                    <p className="text-xl font-bold text-gray-900">{students.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Occupancy</p>
                    <p className="text-xl font-bold text-gray-900">
                      {rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBranch ? 'Edit Branch' : 'Add Branch'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingBranch(null);
                    setFormData({ name: '', address: '', floors: 2, roomsPerFloor: 8, contact: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    className="input"
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floors
                    </label>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      value={formData.floors}
                      onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rooms/Floor
                    </label>
                    <input
                      type="number"
                      className="input"
                      min="4"
                      step="4"
                      value={formData.roomsPerFloor}
                      onChange={(e) => setFormData({ ...formData, roomsPerFloor: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingBranch ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBranch(null);
                      setFormData({ name: '', address: '', floors: 2, roomsPerFloor: 8, contact: '' });
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

export default BranchManagement;
