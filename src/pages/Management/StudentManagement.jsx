import React, { useState, useEffect } from 'react';
import ManagementLayout from '../../components/ManagementLayout';
import { db } from '../../utils/database';
import { Users, Plus, Edit2, Trash2, X, Search, Camera } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filterBranch, setFilterBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    admissionNumber: '',
    aadharNumber: '',
    branchId: '',
    shareType: 2,
    photoUrl: '',
    collegeName: '',
    course: '',
    year: 1,
    guardianName: '',
    guardianPhone: ''
  });

  useEffect(() => {
    loadData();
  }, [filterBranch]);

  const loadData = () => {
    setBranches(db.branches.getAll());
    const allStudents = filterBranch === 'all'
      ? db.students.getAll()
      : db.students.getByBranch(filterBranch);
    setStudents(allStudents);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editingStudent) {
      // Find vacant room
      const vacantRooms = db.rooms.getVacantRooms(formData.branchId, formData.shareType);
      
      if (vacantRooms.length === 0) {
        alert(`No vacant ${formData.shareType}-share rooms available in this branch!`);
        return;
      }

      const assignedRoom = vacantRooms[0];

      // Create student
      const newStudent = db.students.create({
        ...formData,
        roomId: assignedRoom.id,
        roomNumber: assignedRoom.roomNumber,
        floor: assignedRoom.floor,
        photoUrl: formData.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
        dateOfJoining: new Date().toISOString(),
        password: null,
        isFirstLogin: true,
        status: 'active'
      });

      // Update room occupancy
      db.rooms.update(assignedRoom.id, {
        occupiedBeds: assignedRoom.occupiedBeds + 1
      });

      alert(`Student registered successfully!\nRoom: ${assignedRoom.roomNumber}\nFloor: ${assignedRoom.floor}`);
    } else {
      db.students.update(editingStudent.id, formData);
    }

    setShowModal(false);
    setEditingStudent(null);
    resetForm();
    loadData();
  };

  const handleDelete = (student) => {
    if (confirm(`Are you sure you want to remove ${student.name}?`)) {
      // Free up the room
      if (student.roomId) {
        const room = db.rooms.getById(student.roomId);
        if (room) {
          db.rooms.update(room.id, {
            occupiedBeds: Math.max(0, room.occupiedBeds - 1)
          });
        }
      }
      
      db.students.delete(student.id);
      loadData();
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      phoneNumber: student.phoneNumber,
      email: student.email,
      admissionNumber: student.admissionNumber,
      aadharNumber: student.aadharNumber,
      branchId: student.branchId,
      shareType: student.shareType,
      photoUrl: student.photoUrl,
      collegeName: student.collegeName,
      course: student.course,
      year: student.year,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      admissionNumber: '',
      aadharNumber: '',
      branchId: '',
      shareType: 2,
      photoUrl: '',
      collegeName: '',
      course: '',
      year: 1,
      guardianName: '',
      guardianPhone: ''
    });
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phoneNumber.includes(searchTerm) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-1">Manage student registrations</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Student</th>
                <th className="text-left py-3 px-4">Contact</th>
                <th className="text-left py-3 px-4">Branch</th>
                <th className="text-left py-3 px-4">Room</th>
                <th className="text-left py-3 px-4">Course</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const branch = db.branches.getById(student.branchId);
                return (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{student.phoneNumber}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{branch?.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">Room {student.roomNumber}</p>
                      <p className="text-sm text-gray-600">Floor {student.floor}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{student.course}</p>
                      <p className="text-sm text-gray-600">Year {student.year}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingStudent ? 'Edit Student' : 'Add Student'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
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
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.admissionNumber}
                      onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <select
                      className="input"
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      required
                      disabled={editingStudent}
                    >
                      <option value="">Select Branch</option>
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
                      value={formData.shareType}
                      onChange={(e) => setFormData({ ...formData, shareType: parseInt(e.target.value) })}
                      required
                      disabled={editingStudent}
                    >
                      <option value={2}>2-Share</option>
                      <option value={3}>3-Share</option>
                      <option value={4}>4-Share</option>
                      <option value={5}>5-Share</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.collegeName}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      className="input"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guardian Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guardian Phone
                    </label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingStudent ? 'Update' : 'Register'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStudent(null);
                      resetForm();
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

export default StudentManagement;
