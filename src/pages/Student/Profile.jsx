import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/database';
import { User, Mail, Phone, Home, Building2, Calendar, BookOpen } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [branch, setBranch] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    const branchData = db.branches.getById(user.branchId);
    setBranch(branchData);

    // Get payment history for the last 12 months
    const payments = db.payments.getByStudent(user.id);
    setPaymentHistory(payments);
  };

  // Generate payment grid (like GitHub contribution graph)
  const generatePaymentGrid = () => {
    const currentDate = new Date();
    const months = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const payment = paymentHistory.find(p => p.month === month && p.year === year);
      
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: year,
        monthNum: month,
        yearNum: year,
        status: payment ? 'paid' : (date > currentDate ? 'future' : 'pending')
      });
    }
    
    return months;
  };

  const paymentGrid = generatePaymentGrid();

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View your personal information and payment history</p>
        </div>

        {/* Profile Card */}
        <div className="card">
          <div className="flex items-start space-x-6">
            <img
              src={user?.photoUrl}
              alt={user?.name}
              className="w-32 h-32 rounded-full border-4 border-blue-100"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{user?.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{branch?.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span>Room {user?.roomNumber}, Floor {user?.floor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Admission Number</p>
              <p className="font-medium text-gray-900">{user?.admissionNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Aadhar Number</p>
              <p className="font-medium text-gray-900">{user?.aadharNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">College</p>
              <p className="font-medium text-gray-900">{user?.collegeName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Course</p>
              <p className="font-medium text-gray-900">{user?.course} - Year {user?.year}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Guardian Name</p>
              <p className="font-medium text-gray-900">{user?.guardianName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Guardian Phone</p>
              <p className="font-medium text-gray-900">{user?.guardianPhone}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Date of Joining</p>
              <p className="font-medium text-gray-900">
                {new Date(user?.dateOfJoining).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Room Type</p>
              <p className="font-medium text-gray-900">{user?.shareType}-Share</p>
            </div>
          </div>
        </div>

        {/* Payment History Grid */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment History (Last 12 Months)</h2>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {paymentGrid.map((month, index) => (
              <div
                key={index}
                className="relative group"
                title={`${month.month} ${month.year}: ${month.status.toUpperCase()}`}
              >
                <div
                  className={`payment-cell ${month.status}`}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {month.month} {month.year}
                    <div className={`text-xs ${
                      month.status === 'paid' ? 'text-green-400' : 
                      month.status === 'pending' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {month.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Paid</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-gray-600">Future</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Payments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Month</th>
                  <th className="text-left py-3 px-4">Room Fee</th>
                  <th className="text-left py-3 px-4">Mess Fee</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Method</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.slice(0, 6).map(payment => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(payment.year, payment.month - 1).toLocaleString('default', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-3 px-4">₹{payment.roomFee?.toLocaleString()}</td>
                    <td className="py-3 px-4">₹{payment.messFee?.toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium">₹{payment.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge badge-info">{payment.paymentMethod}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paymentHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No payment history available
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Profile;
