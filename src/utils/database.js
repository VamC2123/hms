// Local Storage Database Utility for HMS
// Complete database schema and operations

const DB_KEYS = {
  BRANCHES: 'hms_branches',
  STUDENTS: 'hms_students',
  ROOMS: 'hms_rooms',
  PAYMENTS: 'hms_payments',
  COMPLAINTS: 'hms_complaints',
  POLLS: 'hms_polls',
  ALERTS: 'hms_alerts',
  LEAVE_REQUESTS: 'hms_leave_requests',
  MANAGEMENT_USER: 'hms_management_user',
  SETTINGS: 'hms_settings'
};

// Initialize database with default data
export const initializeDatabase = () => {
  if (!localStorage.getItem(DB_KEYS.MANAGEMENT_USER)) {
    // Default management credentials
    const managementUser = {
      username: 'admin',
      password: 'admin123',
      email: 'admin@hms.com'
    };
    localStorage.setItem(DB_KEYS.MANAGEMENT_USER, JSON.stringify(managementUser));
  }

  if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
    const settings = {
      fees: {
        twoShare: 5000,
        threeShare: 4000,
        fourShare: 3500,
        fiveShare: 3000,
        messFee: 2000
      }
    };
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Initialize empty arrays if not exist
  if (!localStorage.getItem(DB_KEYS.BRANCHES)) {
    localStorage.setItem(DB_KEYS.BRANCHES, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.STUDENTS)) {
    localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.ROOMS)) {
    localStorage.setItem(DB_KEYS.ROOMS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.PAYMENTS)) {
    localStorage.setItem(DB_KEYS.PAYMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.COMPLAINTS)) {
    localStorage.setItem(DB_KEYS.COMPLAINTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.POLLS)) {
    localStorage.setItem(DB_KEYS.POLLS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.ALERTS)) {
    localStorage.setItem(DB_KEYS.ALERTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.LEAVE_REQUESTS)) {
    localStorage.setItem(DB_KEYS.LEAVE_REQUESTS, JSON.stringify([]));
  }
};

// Generic CRUD operations
export const getAll = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const getById = (key, id) => {
  const items = getAll(key);
  return items.find(item => item.id === id);
};

export const create = (key, item) => {
  const items = getAll(key);
  const newItem = { ...item, id: generateId(), createdAt: new Date().toISOString() };
  items.push(newItem);
  localStorage.setItem(key, JSON.stringify(items));
  return newItem;
};

export const update = (key, id, updates) => {
  const items = getAll(key);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(items));
    return items[index];
  }
  return null;
};

export const remove = (key, id) => {
  const items = getAll(key);
  const filtered = items.filter(item => item.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
};

export const query = (key, predicate) => {
  const items = getAll(key);
  return items.filter(predicate);
};

// Specific database operations
export const db = {
  // Branch operations
  branches: {
    getAll: () => getAll(DB_KEYS.BRANCHES),
    getById: (id) => getById(DB_KEYS.BRANCHES, id),
    create: (branch) => create(DB_KEYS.BRANCHES, branch),
    update: (id, updates) => update(DB_KEYS.BRANCHES, id, updates),
    delete: (id) => remove(DB_KEYS.BRANCHES, id)
  },

  // Student operations
  students: {
    getAll: () => getAll(DB_KEYS.STUDENTS),
    getById: (id) => getById(DB_KEYS.STUDENTS, id),
    getByPhone: (phone) => {
      const students = getAll(DB_KEYS.STUDENTS);
      return students.find(s => s.phoneNumber === phone);
    },
    getByBranch: (branchId) => query(DB_KEYS.STUDENTS, s => s.branchId === branchId),
    create: (student) => create(DB_KEYS.STUDENTS, student),
    update: (id, updates) => update(DB_KEYS.STUDENTS, id, updates),
    delete: (id) => remove(DB_KEYS.STUDENTS, id),
    search: (searchTerm) => {
      const students = getAll(DB_KEYS.STUDENTS);
      return students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phoneNumber.includes(searchTerm) ||
        s.admissionNumber.includes(searchTerm)
      );
    }
  },

  // Room operations
  rooms: {
    getAll: () => getAll(DB_KEYS.ROOMS),
    getById: (id) => getById(DB_KEYS.ROOMS, id),
    getByBranch: (branchId) => query(DB_KEYS.ROOMS, r => r.branchId === branchId),
    getVacantRooms: (branchId, shareType) => {
      const rooms = query(DB_KEYS.ROOMS, r => 
        r.branchId === branchId && 
        r.shareType === shareType && 
        r.occupiedBeds < r.totalBeds
      );
      return rooms;
    },
    create: (room) => create(DB_KEYS.ROOMS, room),
    update: (id, updates) => update(DB_KEYS.ROOMS, id, updates),
    delete: (id) => remove(DB_KEYS.ROOMS, id)
  },

  // Payment operations
  payments: {
    getAll: () => getAll(DB_KEYS.PAYMENTS),
    getByStudent: (studentId) => query(DB_KEYS.PAYMENTS, p => p.studentId === studentId),
    getByBranch: (branchId) => query(DB_KEYS.PAYMENTS, p => p.branchId === branchId),
    getByMonth: (month, year) => query(DB_KEYS.PAYMENTS, p => p.month === month && p.year === year),
    create: (payment) => create(DB_KEYS.PAYMENTS, payment),
    update: (id, updates) => update(DB_KEYS.PAYMENTS, id, updates)
  },

  // Complaint operations
  complaints: {
    getAll: () => getAll(DB_KEYS.COMPLAINTS),
    getByStudent: (studentId) => query(DB_KEYS.COMPLAINTS, c => c.studentId === studentId),
    getByBranch: (branchId) => query(DB_KEYS.COMPLAINTS, c => c.branchId === branchId),
    getPending: () => query(DB_KEYS.COMPLAINTS, c => c.status === 'pending'),
    create: (complaint) => create(DB_KEYS.COMPLAINTS, complaint),
    update: (id, updates) => update(DB_KEYS.COMPLAINTS, id, updates)
  },

  // Poll operations
  polls: {
    getAll: () => getAll(DB_KEYS.POLLS),
    getById: (id) => getById(DB_KEYS.POLLS, id),
    getActive: () => query(DB_KEYS.POLLS, p => p.status === 'active'),
    create: (poll) => create(DB_KEYS.POLLS, poll),
    update: (id, updates) => update(DB_KEYS.POLLS, id, updates),
    addResponse: (pollId, studentId, response) => {
      const poll = getById(DB_KEYS.POLLS, pollId);
      if (poll) {
        if (!poll.responses) poll.responses = [];
        poll.responses.push({ studentId, response, timestamp: new Date().toISOString() });
        update(DB_KEYS.POLLS, pollId, poll);
      }
    }
  },

  // Alert operations
  alerts: {
    getAll: () => getAll(DB_KEYS.ALERTS),
    getRecent: (limit = 10) => {
      const alerts = getAll(DB_KEYS.ALERTS);
      return alerts.slice(-limit).reverse();
    },
    create: (alert) => create(DB_KEYS.ALERTS, alert)
  },

  // Leave request operations
  leaveRequests: {
    getAll: () => getAll(DB_KEYS.LEAVE_REQUESTS),
    getByStudent: (studentId) => query(DB_KEYS.LEAVE_REQUESTS, l => l.studentId === studentId),
    getPending: () => query(DB_KEYS.LEAVE_REQUESTS, l => l.status === 'pending'),
    create: (request) => create(DB_KEYS.LEAVE_REQUESTS, request),
    update: (id, updates) => update(DB_KEYS.LEAVE_REQUESTS, id, updates)
  },

  // Settings operations
  settings: {
    get: () => {
      const settings = localStorage.getItem(DB_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : null;
    },
    update: (updates) => {
      const current = JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS) || '{}');
      const updated = { ...current, ...updates };
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    }
  },

  // Management user operations
  management: {
    login: (username, password) => {
      const user = JSON.parse(localStorage.getItem(DB_KEYS.MANAGEMENT_USER));
      return user && user.username === username && user.password === password;
    }
  }
};

// Utility functions
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateRoomNumber = (floor, roomIndex) => {
  return `${floor}${String(roomIndex + 1).padStart(2, '0')}`;
};

// Export DB_KEYS for use in other files
export { DB_KEYS };
