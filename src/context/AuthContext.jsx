import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../utils/database';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'management' or 'student'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('hms_current_user');
    const savedUserType = localStorage.getItem('hms_user_type');
    
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
    }
    setLoading(false);
  }, []);

  const loginManagement = (username, password) => {
    const isValid = db.management.login(username, password);
    if (isValid) {
      const managementUser = { username, role: 'admin' };
      setUser(managementUser);
      setUserType('management');
      localStorage.setItem('hms_current_user', JSON.stringify(managementUser));
      localStorage.setItem('hms_user_type', 'management');
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const loginStudent = (phoneNumber, password) => {
    const student = db.students.getByPhone(phoneNumber);
    
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    // First time login - set password
    if (student.isFirstLogin && !student.password) {
      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }
      
      db.students.update(student.id, {
        password: password,
        isFirstLogin: false
      });

      const updatedStudent = db.students.getById(student.id);
      setUser(updatedStudent);
      setUserType('student');
      localStorage.setItem('hms_current_user', JSON.stringify(updatedStudent));
      localStorage.setItem('hms_user_type', 'student');
      return { success: true, isFirstLogin: true };
    }

    // Regular login
    if (student.password === password) {
      setUser(student);
      setUserType('student');
      localStorage.setItem('hms_current_user', JSON.stringify(student));
      localStorage.setItem('hms_user_type', 'student');
      return { success: true };
    }

    return { success: false, error: 'Invalid password' };
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('hms_current_user');
    localStorage.removeItem('hms_user_type');
  };

  const value = {
    user,
    userType,
    loading,
    loginManagement,
    loginStudent,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
