# Hostel Management System (HMS)

A comprehensive, fully-functional hostel management system built with React and local storage. This system provides complete management capabilities for hostel administrators and a feature-rich portal for students.

## 🏗️ System Architecture

### Technology Stack
- **Frontend Framework**: React 18.2.0
- **Routing**: React Router DOM 6.20.0
- **Styling**: TailwindCSS 3.3.6
- **Icons**: Lucide React 0.294.0
- **Build Tool**: Vite 5.0.8
- **Database**: Browser LocalStorage (No backend required)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     HMS Application                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Management      │         │   Student        │         │
│  │  Portal          │         │   Portal         │         │
│  │                  │         │                  │         │
│  │ - Dashboard      │         │ - Dashboard      │         │
│  │ - Branch Mgmt    │         │ - Profile        │         │
│  │ - Student Mgmt   │         │ - Payments       │         │
│  │ - Room Mgmt      │         │ - Complaints     │         │
│  │ - Payment Mgmt   │         │ - Polls          │         │
│  │ - Complaint Mgmt │         │ - Alerts         │         │
│  │ - Poll Mgmt      │         │ - Leave Request  │         │
│  │ - Alert Mgmt     │         │                  │         │
│  │ - Leave Requests │         │                  │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                            │                    │
│           └────────────┬───────────────┘                    │
│                        │                                     │
│              ┌─────────▼─────────┐                          │
│              │  Auth Context     │                          │
│              │  (Authentication) │                          │
│              └─────────┬─────────┘                          │
│                        │                                     │
│              ┌─────────▼─────────┐                          │
│              │  Database Layer   │                          │
│              │  (LocalStorage)   │                          │
│              └───────────────────┘                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema

### LocalStorage Keys and Data Structure

#### 1. **Branches** (`hms_branches`)
```javascript
{
  id: String,              // Unique identifier
  name: String,            // Branch name
  address: String,         // Complete address
  floors: Number,          // Number of floors
  roomsPerFloor: Number,   // Rooms per floor
  contact: String,         // Contact number
  createdAt: String,       // ISO timestamp
  updatedAt: String        // ISO timestamp
}
```

#### 2. **Students** (`hms_students`)
```javascript
{
  id: String,              // Unique identifier
  name: String,            // Full name
  phoneNumber: String,     // Login credential
  email: String,           // Email address
  admissionNumber: String, // College admission number
  aadharNumber: String,    // Aadhar number
  branchId: String,        // Foreign key to branch
  roomId: String,          // Foreign key to room
  roomNumber: String,      // Room number
  floor: Number,           // Floor number
  shareType: Number,       // 2/3/4/5 share
  photoUrl: String,        // Profile photo URL
  dateOfJoining: String,   // ISO timestamp
  password: String,        // Encrypted password (set on first login)
  isFirstLogin: Boolean,   // First login flag
  collegeName: String,     // College name
  course: String,          // Course (B.Tech, etc.)
  year: Number,            // Academic year
  guardianName: String,    // Guardian name
  guardianPhone: String,   // Guardian contact
  status: String,          // active/inactive
  createdAt: String,       // ISO timestamp
  updatedAt: String        // ISO timestamp
}
```

#### 3. **Rooms** (`hms_rooms`)
```javascript
{
  id: String,              // Unique identifier
  branchId: String,        // Foreign key to branch
  roomNumber: String,      // Room number (e.g., "101")
  floor: Number,           // Floor number
  shareType: Number,       // 2/3/4/5 share
  totalBeds: Number,       // Total beds (same as shareType)
  occupiedBeds: Number,    // Currently occupied beds
  status: String,          // available/maintenance
  createdAt: String,       // ISO timestamp
  updatedAt: String        // ISO timestamp
}
```

#### 4. **Payments** (`hms_payments`)
```javascript
{
  id: String,              // Unique identifier
  studentId: String,       // Foreign key to student
  branchId: String,        // Foreign key to branch
  month: Number,           // Payment month (1-12)
  year: Number,            // Payment year
  roomFee: Number,         // Room fee amount
  messFee: Number,         // Mess fee amount
  totalAmount: Number,     // Total payment
  status: String,          // paid/pending
  paymentDate: String,     // ISO timestamp
  paymentMethod: String,   // Cash/UPI/Card/Bank Transfer
  createdAt: String,       // ISO timestamp
}
```

#### 5. **Complaints** (`hms_complaints`)
```javascript
{
  id: String,              // Unique identifier
  studentId: String,       // Foreign key to student
  branchId: String,        // Foreign key to branch
  roomNumber: String,      // Room number
  type: String,            // Complaint type
  description: String,     // Detailed description
  status: String,          // pending/resolved
  priority: String,        // low/medium/high
  resolvedAt: String,      // ISO timestamp (when resolved)
  createdAt: String,       // ISO timestamp
  updatedAt: String        // ISO timestamp
}
```

#### 6. **Polls** (`hms_polls`)
```javascript
{
  id: String,              // Unique identifier
  question: String,        // Poll question
  options: Array<String>,  // Array of options
  responses: Array<{       // Array of responses
    studentId: String,
    response: String,
    timestamp: String
  }>,
  status: String,          // active/closed
  createdBy: String,       // admin
  createdAt: String,       // ISO timestamp
  updatedAt: String        // ISO timestamp
}
```

#### 7. **Alerts** (`hms_alerts`)
```javascript
{
  id: String,              // Unique identifier
  title: String,           // Alert title
  message: String,         // Alert message
  priority: String,        // low/medium/high
  createdBy: String,       // admin
  createdAt: String        // ISO timestamp
}
```

#### 8. **Leave Requests** (`hms_leave_requests`)
```javascript
{
  id: String,              // Unique identifier
  studentId: String,       // Foreign key to student
  branchId: String,        // Foreign key to branch
  fromDate: String,        // Start date
  toDate: String,          // End date
  duration: Number,        // Duration in days
  reason: String,          // Leave reason
  leaveType: String,       // Home Visit/Medical/Emergency/Personal/Other
  status: String,          // pending/approved/rejected
  approvedAt: String,      // ISO timestamp
  approvedBy: String,      // admin username
  rejectedAt: String,      // ISO timestamp
  rejectedBy: String,      // admin username
  createdAt: String,       // ISO timestamp
  updatedAt: String        // ISO timestamp
}
```

#### 9. **Settings** (`hms_settings`)
```javascript
{
  fees: {
    twoShare: Number,      // 2-share room fee
    threeShare: Number,    // 3-share room fee
    fourShare: Number,     // 4-share room fee
    fiveShare: Number,     // 5-share room fee
    messFee: Number        // Monthly mess fee
  }
}
```

#### 10. **Management User** (`hms_management_user`)
```javascript
{
  username: String,        // Admin username
  password: String,        // Admin password
  email: String            // Admin email
}
```

## 🚀 Features

### Management Portal Features

1. **Dashboard**
   - Real-time statistics (students, rooms, payments, complaints)
   - Branch-wise filtering
   - Room distribution by share type
   - Student search functionality
   - Payment overview (paid/pending)
   - Quick actions panel
   - Recent alerts display

2. **Branch Management**
   - Create new branches with floor and room configuration
   - Edit branch details
   - Delete branches (with cascading data cleanup)
   - View branch statistics (rooms, students, occupancy)
   - Automatic room generation on branch creation

3. **Student Management**
   - Register new students with complete details
   - Automatic room allocation based on availability
   - Edit student information
   - Remove students (auto-frees room)
   - Search and filter students
   - Photo upload support
   - View student details with room assignment

4. **Room Management**
   - Visual room occupancy display
   - Floor-wise room organization
   - Filter by branch and share type
   - Color-coded status (vacant/partial/full)
   - Real-time occupancy statistics
   - Bed-level tracking

5. **Payment Management**
   - Customizable fee structure
   - Month and branch-wise filtering
   - Payment status tracking (paid/pending)
   - Detailed payment records
   - Collection rate analytics
   - Fee settings management

6. **Complaint Management**
   - View all complaints with filtering
   - Priority-based categorization
   - Status tracking (pending/resolved)
   - Branch-wise filtering
   - Mark complaints as resolved
   - Timestamp tracking

7. **Poll Management**
   - Create polls with multiple options
   - Real-time response tracking
   - Visual result representation (bar graphs)
   - Close polls to stop voting
   - Response percentage calculation

8. **Alert Management**
   - Send system-wide alerts
   - Priority levels (low/medium/high)
   - Alert history tracking
   - Broadcast to all students

9. **Leave Request Management**
   - View all leave requests
   - Approve/reject requests
   - Status tracking with timestamps
   - Duration calculation
   - Reason viewing

### Student Portal Features

1. **Dashboard**
   - Personalized welcome with photo
   - Quick stats (pending payments, complaints, leave requests)
   - Room details card
   - Recent alerts display
   - Quick action buttons

2. **Profile**
   - Complete profile information
   - Payment history visualization (GitHub-style grid)
   - 12-month payment calendar
   - Personal and academic details
   - Guardian information
   - Recent payment transactions

3. **Fee Payment**
   - Current month payment status
   - Fee breakdown (room + mess)
   - Multiple payment methods
   - Dummy payment system
   - Payment confirmation
   - Auto-update on payment

4. **Complaints**
   - Raise new complaints
   - Track complaint status
   - Priority selection
   - Category-based complaint types
   - Real-time status updates
   - Resolved complaint history

5. **Polls**
   - View active and closed polls
   - Vote on active polls
   - View results after voting
   - Visual result representation
   - Response tracking

6. **Alerts**
   - View all system alerts
   - Priority-based display
   - Alert statistics
   - Time-based filtering

7. **Leave Requests**
   - Submit leave requests
   - Date range selection
   - Leave type categorization
   - Status tracking (pending/approved/rejected)
   - Request history

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with TailwindCSS
- **Color-coded Status**: Easy visual identification
- **Interactive Components**: Hover effects, transitions, animations
- **Data Visualization**: Charts, graphs, payment grids
- **Real-time Updates**: Instant feedback on actions
- **Modal Dialogs**: Clean form interactions
- **Badge System**: Status indicators throughout

## 📝 Default Credentials

### Management Login
- **Username**: `admin`
- **Password**: `admin123`

### Student Login
- **Phone Number**: Any dummy student phone (e.g., `9876500000`)
- **Password**: Set on first login (min 6 characters)

## 🗂️ Dummy Data

The system comes pre-populated with:
- **3 Branches**: Downtown Branch, Uptown Branch, Suburb Branch
- **30 Students**: 10 students per branch
- **Multiple Rooms**: Various share types (2/3/4/5 share)
- **Payment History**: Last 6 months with random payments
- **Sample Complaints**: Random complaints for demonstration
- **Active Polls**: 2 pre-created polls
- **System Alerts**: 3 sample alerts

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## 📂 Project Structure

```
windsurf-project/
├── src/
│   ├── components/
│   │   ├── ManagementLayout.jsx    # Management portal layout
│   │   └── StudentLayout.jsx       # Student portal layout
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication context
│   ├── pages/
│   │   ├── Management/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BranchManagement.jsx
│   │   │   ├── StudentManagement.jsx
│   │   │   ├── RoomManagement.jsx
│   │   │   ├── PaymentManagement.jsx
│   │   │   ├── ComplaintManagement.jsx
│   │   │   ├── PollManagement.jsx
│   │   │   ├── AlertManagement.jsx
│   │   │   └── LeaveRequestManagement.jsx
│   │   ├── Student/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── Complaints.jsx
│   │   │   ├── Polls.jsx
│   │   │   ├── Alerts.jsx
│   │   │   └── LeaveRequest.jsx
│   │   └── LoginPage.jsx
│   ├── utils/
│   │   ├── database.js             # Database operations
│   │   └── dummyData.js            # Dummy data initialization
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔐 Security Considerations

**Note**: This is a demo application using local storage. For production:
- Implement proper backend authentication
- Use secure password hashing (bcrypt, argon2)
- Implement JWT or session-based authentication
- Use HTTPS
- Validate and sanitize all inputs
- Implement rate limiting
- Add CSRF protection
- Use environment variables for sensitive data

## 🚦 Data Flow

### Management Flow
1. Admin logs in with credentials
2. Authentication context verifies credentials
3. Admin is redirected to dashboard
4. All actions update local storage immediately
5. UI reflects changes in real-time

### Student Flow
1. Student logs in with phone number
2. First-time login requires password setup
3. Password is stored for future logins
4. Student accesses their portal
5. All interactions update local storage
6. Changes reflect immediately in management portal

## 🎯 Key Business Logic

### Room Allocation
- Searches for vacant rooms of requested share type
- Automatically assigns first available room
- Updates room occupancy counter
- Prevents over-allocation

### Payment Tracking
- Month-wise payment tracking
- Automatic fee calculation based on room type
- Visual payment history (12 months)
- Pending payment identification

### Complaint Resolution
- Status tracking from submission to resolution
- Priority-based filtering
- Timestamp tracking for SLA monitoring

### Poll Response
- One vote per student per poll
- Real-time result calculation
- Percentage-based visualization

### Leave Request Workflow
- Submission → Pending → Approved/Rejected
- Duration auto-calculation
- Status notification to student

## 🌟 Best Practices Implemented

- Component-based architecture
- Reusable utility functions
- Consistent naming conventions
- Proper error handling
- User feedback (alerts, confirmations)
- Data validation
- Responsive design
- Accessibility considerations
- Clean code organization
- Comprehensive comments

## 🐛 Troubleshooting

### Issue: Data not persisting
- **Solution**: Check browser's local storage is not disabled

### Issue: Login not working
- **Solution**: Clear local storage and refresh page to reinitialize dummy data

### Issue: Styles not loading
- **Solution**: Ensure TailwindCSS is properly configured and run `npm run dev` again

## 📈 Future Enhancements

- Real backend integration (Node.js + MongoDB/PostgreSQL)
- Real-time notifications (Socket.io)
- Email/SMS notifications
- Advanced reporting and analytics
- Expense tracking
- Mess menu management
- Visitor management
- Inventory management
- Staff management
- Mobile app (React Native)

## 📄 License

This project is for demonstration purposes. Feel free to use and modify as needed.

## 👥 Support

For issues or questions, please refer to the codebase documentation or create an issue in the repository.

---

**Built with ❤️ using React, TailwindCSS, and Vite**
#   h m s  
 