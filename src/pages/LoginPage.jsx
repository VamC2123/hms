import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Lock, Phone } from 'lucide-react';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('management'); // 'management' or 'student'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const { loginManagement, loginStudent } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (loginType === 'management') {
      const result = loginManagement(formData.username, formData.password);
      if (!result.success) {
        setError(result.error);
      }
    } else {
      const result = loginStudent(formData.phoneNumber, formData.password);
      if (!result.success) {
        setError(result.error);
      } else if (result.isFirstLogin) {
        setIsFirstLogin(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">HMS</h1>
          <p className="text-blue-100 mt-2">Hostel Management System</p>
        </div>

        {/* Login Type Selector */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              loginType === 'management'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => {
              setLoginType('management');
              setError('');
              setFormData({ username: '', password: '', phoneNumber: '' });
            }}
          >
            <User className="w-5 h-5 inline mr-2" />
            Management
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              loginType === 'student'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => {
              setLoginType('student');
              setError('');
              setFormData({ username: '', password: '', phoneNumber: '' });
            }}
          >
            <User className="w-5 h-5 inline mr-2" />
            Student
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isFirstLogin && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              Welcome! Your password has been set successfully.
            </div>
          )}

          {loginType === 'management' ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    className="input pl-10"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    className="input pl-10"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    className="input pl-10"
                    placeholder={
                      formData.phoneNumber
                        ? 'Enter password (or set new password for first login)'
                        : 'Enter password'
                    }
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  First time login? Set a password (min 6 characters)
                </p>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary w-full text-lg">
            Login
          </button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-700 mb-2">Demo Credentials:</p>
            {loginType === 'management' ? (
              <div className="text-gray-600">
                <p>Username: <span className="font-mono bg-white px-2 py-1 rounded">admin</span></p>
                <p className="mt-1">Password: <span className="font-mono bg-white px-2 py-1 rounded">admin123</span></p>
              </div>
            ) : (
              <div className="text-gray-600">
                <p>Phone: <span className="font-mono bg-white px-2 py-1 rounded">9876500000</span></p>
                <p className="text-xs mt-1 text-gray-500">Use any dummy student phone from the system</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
