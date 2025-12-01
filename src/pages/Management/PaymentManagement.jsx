import React, { useState, useEffect } from 'react';
import ManagementLayout from '../../components/ManagementLayout';
import { db } from '../../utils/database';
import { CreditCard, DollarSign, TrendingUp, Settings, Save } from 'lucide-react';

const PaymentManagement = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalPaid: 0, totalPending: 0, paidCount: 0, pendingCount: 0 });
  const [settings, setSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [feeSettings, setFeeSettings] = useState({
    twoShare: 5000,
    threeShare: 4000,
    fourShare: 3500,
    fiveShare: 3000,
    messFee: 2000
  });

  useEffect(() => {
    loadData();
  }, [selectedBranch, selectedMonth, selectedYear]);

  const loadData = () => {
    setBranches(db.branches.getAll());
    const currentSettings = db.settings.get();
    setSettings(currentSettings);
    setFeeSettings(currentSettings.fees);

    const allStudents = selectedBranch === 'all'
      ? db.students.getAll()
      : db.students.getByBranch(selectedBranch);

    const monthPayments = db.payments.getByMonth(selectedMonth, selectedYear);

    let paymentList = [];
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;

    allStudents.forEach(student => {
      const studentPayment = monthPayments.find(p => p.studentId === student.id);
      const branch = db.branches.getById(student.branchId);

      if (studentPayment) {
        paymentList.push({
          ...studentPayment,
          student,
          branch,
          status: 'paid'
        });
        totalPaid += studentPayment.totalAmount;
        paidCount++;
      } else {
        const roomFee = currentSettings.fees[`${student.shareType}Share`] || 4000;
        const messFee = currentSettings.fees.messFee || 2000;
        const totalAmount = roomFee + messFee;

        paymentList.push({
          student,
          branch,
          status: 'pending',
          roomFee,
          messFee,
          totalAmount
        });
        totalPending += totalAmount;
        pendingCount++;
      }
    });

    setPayments(paymentList);
    setStats({ totalPaid, totalPending, paidCount, pendingCount });
  };

  const handleUpdateSettings = () => {
    db.settings.update({ fees: feeSettings });
    setShowSettings(false);
    loadData();
    alert('Fee settings updated successfully!');
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">Track and manage student payments</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-secondary flex items-center"
          >
            <Settings className="w-5 h-5 mr-2" />
            Fee Settings
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Paid</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">₹{stats.totalPaid.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.paidCount} payments</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Pending</p>
              <DollarSign className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">₹{stats.totalPending.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.pendingCount} pending</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-2">Collection Rate</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.paidCount + stats.pendingCount > 0
                ? Math.round((stats.paidCount / (stats.paidCount + stats.pendingCount)) * 100)
                : 0}%
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-2">Total Expected</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{(stats.totalPaid + stats.totalPending).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                className="input"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                className="input"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Student</th>
                <th className="text-left py-3 px-4">Branch</th>
                <th className="text-left py-3 px-4">Room Fee</th>
                <th className="text-left py-3 px-4">Mess Fee</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={payment.student.photoUrl}
                        alt={payment.student.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{payment.student.name}</p>
                        <p className="text-sm text-gray-600">{payment.student.phoneNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">{payment.branch?.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">₹{payment.roomFee?.toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">₹{payment.messFee?.toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">₹{payment.totalAmount?.toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    {payment.status === 'paid' ? (
                      <span className="badge badge-success">Paid</span>
                    ) : (
                      <span className="badge badge-danger">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString()
                        : '-'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fee Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Fee Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    2-Share Room Fee (₹)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={feeSettings.twoShare}
                    onChange={(e) => setFeeSettings({ ...feeSettings, twoShare: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    3-Share Room Fee (₹)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={feeSettings.threeShare}
                    onChange={(e) => setFeeSettings({ ...feeSettings, threeShare: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    4-Share Room Fee (₹)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={feeSettings.fourShare}
                    onChange={(e) => setFeeSettings({ ...feeSettings, fourShare: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    5-Share Room Fee (₹)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={feeSettings.fiveShare}
                    onChange={(e) => setFeeSettings({ ...feeSettings, fiveShare: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mess Fee (₹)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={feeSettings.messFee}
                    onChange={(e) => setFeeSettings({ ...feeSettings, messFee: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button onClick={handleUpdateSettings} className="btn btn-primary flex-1 flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setFeeSettings(settings.fees);
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagementLayout>
  );
};

export default PaymentManagement;
