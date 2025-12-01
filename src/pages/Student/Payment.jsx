import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/database';
import { CreditCard, Check, X, Calendar } from 'lucide-react';

const Payment = () => {
  const { user } = useAuth();
  const [currentMonthPayment, setCurrentMonthPayment] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    const settings = db.settings.get();
    const roomFee = settings.fees[`${user.shareType}Share`];
    const messFee = settings.fees.messFee;
    
    setFeeDetails({
      roomFee,
      messFee,
      total: roomFee + messFee
    });

    // Check if current month payment exists
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const payments = db.payments.getByStudent(user.id);
    const payment = payments.find(p => p.month === currentMonth && p.year === currentYear);
    
    setCurrentMonthPayment(payment);
  };

  const handlePayment = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    db.payments.create({
      studentId: user.id,
      branchId: user.branchId,
      month: currentMonth,
      year: currentYear,
      roomFee: feeDetails.roomFee,
      messFee: feeDetails.messFee,
      totalAmount: feeDetails.total,
      status: 'paid',
      paymentDate: new Date().toISOString(),
      paymentMethod: paymentMethod
    });

    setShowPaymentModal(false);
    loadData();
    alert('Payment successful! Thank you.');
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Payment</h1>
          <p className="text-gray-600 mt-1">Manage your hostel and mess payments</p>
        </div>

        {/* Current Month Status */}
        <div className={`card ${currentMonthPayment ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentMonth} Payment Status
              </h2>
              {currentMonthPayment ? (
                <div className="flex items-center space-x-2 text-green-700">
                  <Check className="w-6 h-6" />
                  <span className="text-lg font-medium">Paid on {new Date(currentMonthPayment.paymentDate).toLocaleDateString()}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-700">
                  <X className="w-6 h-6" />
                  <span className="text-lg font-medium">Payment Pending</span>
                </div>
              )}
            </div>
            {!currentMonthPayment && feeDetails && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="btn btn-primary text-lg px-6 py-3"
              >
                Pay Now - ₹{feeDetails.total.toLocaleString()}
              </button>
            )}
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Fee Breakdown</h2>
          {feeDetails && (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Room Fee ({user?.shareType}-Share)</p>
                  <p className="text-sm text-gray-600">Per bed monthly charge</p>
                </div>
                <p className="text-xl font-bold text-gray-900">₹{feeDetails.roomFee.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">Mess Fee</p>
                  <p className="text-sm text-gray-600">Monthly food charges</p>
                </div>
                <p className="text-xl font-bold text-gray-900">₹{feeDetails.messFee.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between py-3 bg-blue-50 rounded-lg px-4">
                <p className="text-lg font-bold text-gray-900">Total Monthly Fee</p>
                <p className="text-2xl font-bold text-primary">₹{feeDetails.total.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Information */}
        <div className="card bg-blue-50">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Payment Information</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Monthly payments are due by the 5th of each month</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Late payments may incur additional charges</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Payment receipts are generated automatically after successful payment</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>For payment issues, contact the management office</span>
            </li>
          </ul>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && feeDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Payment</h2>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Room Fee:</span>
                  <span className="font-medium">₹{feeDetails.roomFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Mess Fee:</span>
                  <span className="font-medium">₹{feeDetails.messFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-bold text-lg text-primary">₹{feeDetails.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  className="input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">UPI</option>
                  <option value="Card">Debit/Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  This is a dummy payment system. In production, integrate with real payment gateway.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handlePayment}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirm Payment
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default Payment;
