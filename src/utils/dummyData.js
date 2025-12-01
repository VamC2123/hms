import { db, generateId, generateRoomNumber } from './database';

// Dummy data for 3 branches with 10 students each
export const initializeDummyData = () => {
  // Check if data already exists
  if (db.branches.getAll().length > 0) {
    return; // Already initialized
  }

  // Create 3 branches
  const branches = [
    {
      name: 'Downtown Branch',
      address: '123 Main Street, Downtown',
      floors: 3,
      roomsPerFloor: 8,
      contact: '+91 9876543210'
    },
    {
      name: 'Uptown Branch',
      address: '456 Hill Road, Uptown',
      floors: 4,
      roomsPerFloor: 6,
      contact: '+91 9876543211'
    },
    {
      name: 'Suburb Branch',
      address: '789 Garden Avenue, Suburbs',
      floors: 2,
      roomsPerFloor: 10,
      contact: '+91 9876543212'
    }
  ];

  const createdBranches = branches.map(branch => db.branches.create(branch));

  // Student names pool
  const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Divya', 'Karan', 'Pooja'];
  const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Iyer', 'Gupta', 'Mehta', 'Joshi', 'Nair'];

  // Create rooms and students for each branch
  createdBranches.forEach((branch, branchIndex) => {
    const shareTypes = [2, 3, 4, 5];
    let roomCounter = 0;

    // Create rooms
    for (let floor = 1; floor <= branch.floors; floor++) {
      for (let room = 0; room < Math.floor(branch.roomsPerFloor / 4); room++) {
        shareTypes.forEach(shareType => {
          const roomNumber = generateRoomNumber(floor, roomCounter++);
          db.rooms.create({
            branchId: branch.id,
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

    // Create 10 students per branch
    for (let i = 0; i < 10; i++) {
      const firstName = firstNames[i];
      const lastName = lastNames[i];
      const phoneNumber = `98765${branchIndex}${String(i).padStart(4, '0')}`;
      const admissionNumber = `ADM${branchIndex + 1}${String(i + 1).padStart(3, '0')}`;

      // Get random vacant room
      const availableRooms = db.rooms.getVacantRooms(branch.id, Math.floor(Math.random() * 4) + 2);
      let assignedRoom = null;

      if (availableRooms.length > 0) {
        const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
        assignedRoom = randomRoom;
        // Update room occupancy
        db.rooms.update(randomRoom.id, {
          occupiedBeds: randomRoom.occupiedBeds + 1
        });
      }

      // Create student
      const student = db.students.create({
        name: `${firstName} ${lastName}`,
        phoneNumber,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.com`,
        admissionNumber,
        aadharNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        branchId: branch.id,
        roomId: assignedRoom ? assignedRoom.id : null,
        roomNumber: assignedRoom ? assignedRoom.roomNumber : null,
        floor: assignedRoom ? assignedRoom.floor : null,
        shareType: assignedRoom ? assignedRoom.shareType : null,
        photoUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
        dateOfJoining: new Date(2024, 0, i + 1).toISOString(),
        password: null, // Will be set on first login
        isFirstLogin: true,
        collegeName: 'ABC Engineering College',
        course: 'B.Tech',
        year: Math.floor(Math.random() * 4) + 1,
        guardianName: `${firstName}'s Parent`,
        guardianPhone: `97865${branchIndex}${String(i).padStart(4, '0')}`,
        status: 'active'
      });

      // Create payment history (random payments for last 6 months)
      const currentDate = new Date();
      const settings = db.settings.get();
      
      for (let month = 0; month < 6; month++) {
        const paymentDate = new Date(currentDate);
        paymentDate.setMonth(currentDate.getMonth() - month);
        
        const isPaid = Math.random() > 0.3; // 70% payment rate
        
        if (isPaid) {
          const roomFee = settings.fees[`${assignedRoom?.shareType || 2}Share`] || 4000;
          const messFee = settings.fees.messFee;
          
          db.payments.create({
            studentId: student.id,
            branchId: branch.id,
            month: paymentDate.getMonth() + 1,
            year: paymentDate.getFullYear(),
            roomFee,
            messFee,
            totalAmount: roomFee + messFee,
            status: 'paid',
            paymentDate: paymentDate.toISOString(),
            paymentMethod: ['Cash', 'UPI', 'Card'][Math.floor(Math.random() * 3)]
          });
        }
      }

      // Create some complaints (random)
      if (Math.random() > 0.6) {
        const complaintTypes = [
          'AC not working',
          'Water supply issue',
          'Electricity problem',
          'Cleanliness issue',
          'Furniture repair needed'
        ];
        
        db.complaints.create({
          studentId: student.id,
          branchId: branch.id,
          roomNumber: assignedRoom?.roomNumber,
          type: complaintTypes[Math.floor(Math.random() * complaintTypes.length)],
          description: 'Need immediate attention to resolve this issue.',
          status: Math.random() > 0.5 ? 'pending' : 'resolved',
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        });
      }
    }
  });

  // Create some polls
  const polls = [
    {
      question: 'What time should mess breakfast be served?',
      options: ['7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM'],
      responses: [],
      status: 'active',
      createdBy: 'admin'
    },
    {
      question: 'Which day should be designated for room cleaning?',
      options: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      responses: [],
      status: 'active',
      createdBy: 'admin'
    }
  ];

  polls.forEach(poll => db.polls.create(poll));

  // Create some alerts
  const alerts = [
    {
      title: 'Maintenance Notice',
      message: 'Water supply will be interrupted on Sunday from 9 AM to 12 PM for maintenance.',
      priority: 'high',
      createdBy: 'admin'
    },
    {
      title: 'Mess Menu Update',
      message: 'New mess menu will be available from next week. Check the notice board.',
      priority: 'medium',
      createdBy: 'admin'
    },
    {
      title: 'Payment Reminder',
      message: 'Please clear your pending dues before month end to avoid late fees.',
      priority: 'high',
      createdBy: 'admin'
    }
  ];

  alerts.forEach(alert => db.alerts.create(alert));

  console.log('✅ Dummy data initialized successfully!');
  console.log(`Created ${createdBranches.length} branches`);
  console.log(`Created ${db.students.getAll().length} students`);
  console.log(`Created ${db.rooms.getAll().length} rooms`);
};
