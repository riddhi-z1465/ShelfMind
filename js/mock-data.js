/**
 * ShelfMind: RFID Library Automation & Digital Lending
 * Central Mock Data & State Management Service
 * Designed for Academic & SE Demonstration (B.Tech CSE)
 */

const STORAGE_KEY = 'shelfmind_library_state_v1';

const DEFAULT_STATE = {
  projectMetrics: {
    totalVolumes: 340000,
    untraceableBooks: 4100,
    rfidHandhelds: 6,
    tagsPerMinHandheld: 180,
    maxConcurrentLicences: 5,
    idleTimeoutMinutes: 20,
    digitalLoanPeriodDays: 14,
    booksIssuedToday: 142,
    booksReturnedToday: 118,
    activeReservationsCount: 29,
    pendingFinesTotal: 1840,
    rfidSystemStatus: 'Operational',
    gateStatus: 'Operational'
  },
  
  // 5 Concurrent E-Book Licences (Controlled Lending)
  digitalLicences: [
    {
      id: 'LIC-01',
      slot: 1,
      status: 'occupied',
      user: 'Aarav Sharma (21BCE1042)',
      role: 'Student',
      bookTitle: 'Operating System Concepts (Silberschatz)',
      bookId: 'EB-101',
      sessionStarted: '42 mins ago',
      lastActiveMinutesAgo: 6,
      ipAddress: '172.16.14.88'
    },
    {
      id: 'LIC-02',
      slot: 2,
      status: 'occupied',
      user: 'Pooja Iyer (20BCS0811)',
      role: 'Student',
      bookTitle: 'Database System Concepts (Korth)',
      bookId: 'EB-102',
      sessionStarted: '1 hour ago',
      lastActiveMinutesAgo: 14,
      ipAddress: '172.16.14.92'
    },
    {
      id: 'LIC-03',
      slot: 3,
      status: 'occupied',
      user: 'Dr. Ramesh Kumar (FAC-049)',
      role: 'Faculty',
      bookTitle: 'Introduction to Algorithms (CLRS)',
      bookId: 'EB-103',
      sessionStarted: '25 mins ago',
      lastActiveMinutesAgo: 2,
      ipAddress: '172.16.8.12'
    },
    {
      id: 'LIC-04',
      slot: 4,
      status: 'occupied',
      user: 'Neha Kulkarni (22BCE0319)',
      role: 'Student',
      bookTitle: 'Computer Networks: A Systems Approach',
      bookId: 'EB-104',
      sessionStarted: '18 mins ago',
      lastActiveMinutesAgo: 19, // Inactive near 20min timeout threshold!
      ipAddress: '172.16.14.105'
    },
    {
      id: 'LIC-05',
      slot: 5,
      status: 'available',
      user: null,
      role: null,
      bookTitle: null,
      bookId: null,
      sessionStarted: null,
      lastActiveMinutesAgo: null,
      ipAddress: null
    }
  ],

  ebookCatalogue: [
    {
      id: 'EB-101',
      title: 'Operating System Concepts (10th Edition)',
      authors: 'Silberschatz, Galvin, Gagne',
      category: 'Systems & Architecture',
      isbn: '978-1119800361',
      totalPages: 1240,
      format: 'Encrypted EPUB / PDF Stream',
      coverColor: '#1e3a8a',
      activeReaders: 1,
      totalHolders: 5
    },
    {
      id: 'EB-102',
      title: 'Database System Concepts (7th Edition)',
      authors: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
      category: 'Data Engineering',
      isbn: '978-0078022159',
      totalPages: 1376,
      format: 'Encrypted PDF Stream',
      coverColor: '#065f46',
      activeReaders: 1,
      totalHolders: 5
    },
    {
      id: 'EB-103',
      title: 'Introduction to Algorithms (CLRS 4th Edition)',
      authors: 'Cormen, Leiserson, Rivest, Stein',
      category: 'Computer Science Core',
      isbn: '978-0262046305',
      totalPages: 1312,
      format: 'Secure Academic PDF',
      coverColor: '#831843',
      activeReaders: 1,
      totalHolders: 5
    },
    {
      id: 'EB-104',
      title: 'Computer Networks: A Systems Approach',
      authors: 'Larry L. Peterson, Bruce S. Davie',
      category: 'Networking',
      isbn: '978-0123850591',
      totalPages: 928,
      format: 'Encrypted EPUB',
      coverColor: '#1e293b',
      activeReaders: 1,
      totalHolders: 5
    },
    {
      id: 'EB-105',
      title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
      authors: 'Stuart Russell, Peter Norvig',
      category: 'Artificial Intelligence',
      isbn: '978-0134610993',
      totalPages: 1166,
      format: 'Encrypted EPUB / PDF',
      coverColor: '#7c2d12',
      activeReaders: 0,
      totalHolders: 5
    },
    {
      id: 'EB-106',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      authors: 'Robert C. Martin',
      category: 'Software Engineering',
      isbn: '978-0132350884',
      totalPages: 464,
      format: 'Encrypted EPUB',
      coverColor: '#312e81',
      activeReaders: 0,
      totalHolders: 5
    }
  ],

  // Physical Books with RFID tags
  books: [
    {
      id: 'BK-1001',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      rfidTag: 'RFID-001284',
      category: 'Software Engineering',
      status: 'Available',
      shelfLocation: 'Stack CS-02-B',
      callNumber: 'QA76.76.C66 M37 2008',
      publisher: 'Prentice Hall',
      publishYear: 2008,
      edition: '1st Edition',
      borrowCount: 68,
      currentBorrower: null,
      dueDate: null,
      history: [
        { date: '2026-09-15', user: 'Rohan Mehra (22BCE114)', action: 'Returned', condition: 'Good' },
        { date: '2026-08-30', user: 'Rohan Mehra (22BCE114)', action: 'Issued (RFID Station 02)', condition: 'Good' }
      ]
    },
    {
      id: 'BK-1002',
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      author: 'David Thomas, Andrew Hunt',
      isbn: '978-0135957059',
      rfidTag: 'RFID-004821',
      category: 'Software Engineering',
      status: 'Issued',
      shelfLocation: 'Stack CS-02-C',
      callNumber: 'QA76.6 .H857 2019',
      publisher: 'Addison-Wesley',
      publishYear: 2019,
      edition: '20th Anniversary Edition',
      borrowCount: 94,
      currentBorrower: {
        name: 'Student Account (Karan Verma - 21BCE041)',
        id: '21BCE041',
        issueDate: '2026-08-28',
        dueDate: '2026-09-12' // Overdue in current demo context!
      },
      dueDate: '2026-09-12',
      history: [
        { date: '2026-08-28', user: 'Karan Verma (21BCE041)', action: 'Issued (Self-Service Kiosk)', condition: 'Good' }
      ]
    },
    {
      id: 'BK-1003',
      title: 'Computer Networks: A Top-Down Approach',
      author: 'James Kurose, Keith Ross',
      isbn: '978-0136681557',
      rfidTag: 'RFID-007192',
      category: 'Networking',
      status: 'Available',
      shelfLocation: 'Stack CS-05-A',
      callNumber: 'TK5105.5 .K87 2021',
      publisher: 'Pearson',
      publishYear: 2021,
      edition: '8th Edition',
      borrowCount: 112,
      currentBorrower: null,
      dueDate: null,
      history: [
        { date: '2026-09-22', user: 'Ananya Sen (23BCS092)', action: 'Returned', condition: 'Good' }
      ]
    },
    {
      id: 'BK-1004',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Gamma, Helm, Johnson, Vlissides (GoF)',
      isbn: '978-0201633610',
      rfidTag: 'RFID-009413',
      category: 'Software Architecture',
      status: 'Reserved',
      shelfLocation: 'Stack CS-03-A (Hold Shelf)',
      callNumber: 'QA76.64 .D47 1994',
      publisher: 'Addison-Wesley',
      publishYear: 1994,
      edition: '1st Edition',
      borrowCount: 145,
      currentBorrower: null,
      dueDate: null,
      reservedFor: 'Vikas Rao (21BCS019)',
      history: [
        { date: '2026-09-28', user: 'Vikas Rao (21BCS019)', action: 'Hold Placed (Hold shelf assigned)', condition: 'Good' }
      ]
    },
    {
      id: 'BK-1005',
      title: 'Operating System Concepts',
      author: 'Abraham Silberschatz, Peter Galvin',
      isbn: '978-1119800361',
      rfidTag: 'RFID-002345',
      category: 'Systems & Architecture',
      status: 'Available',
      shelfLocation: 'Stack CS-01-D',
      callNumber: 'QA76.76.O63 S558 2018',
      publisher: 'Wiley',
      publishYear: 2018,
      edition: '10th Edition',
      borrowCount: 203,
      currentBorrower: null,
      dueDate: null,
      history: []
    },
    {
      id: 'BK-1006',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen, Charles E. Leiserson',
      isbn: '978-0262046305',
      rfidTag: 'RFID-008912',
      category: 'Algorithms & Data Structures',
      status: 'Issued',
      shelfLocation: 'Stack CS-04-B',
      callNumber: 'QA76.6 .C662 2022',
      publisher: 'MIT Press',
      publishYear: 2022,
      edition: '4th Edition',
      borrowCount: 178,
      currentBorrower: {
        name: 'Sneha Patel (22BCE209)',
        id: '22BCE209',
        issueDate: '2026-09-20',
        dueDate: '2026-10-04'
      },
      dueDate: '2026-10-04',
      history: []
    },
    {
      id: 'BK-1007',
      title: 'Compilers: Principles, Techniques, and Tools (Dragon Book)',
      author: 'Aho, Lam, Sethi, Ullman',
      isbn: '978-0321486813',
      rfidTag: 'RFID-003341',
      category: 'Theoretical Computer Science',
      status: 'Missing',
      shelfLocation: 'Stack CS-06-B',
      callNumber: 'QA76.76.C65 A37 2006',
      publisher: 'Addison-Wesley',
      publishYear: 2006,
      edition: '2nd Edition',
      borrowCount: 54,
      currentBorrower: null,
      dueDate: null,
      note: 'Tagged missing during Handheld Sweep Cycle 4. Not reconciled.',
      history: []
    },
    {
      id: 'BK-1008',
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell, Peter Norvig',
      isbn: '978-0134610993',
      rfidTag: 'RFID-005619',
      category: 'Artificial Intelligence',
      status: 'Under Verification',
      shelfLocation: 'Stack CS-08-A',
      callNumber: 'Q335 .R86 2020',
      publisher: 'Pearson',
      publishYear: 2020,
      edition: '4th Edition',
      borrowCount: 89,
      currentBorrower: null,
      dueDate: null,
      history: []
    },
    {
      id: 'BK-1009',
      title: 'Distributed Systems: Concepts and Design',
      author: 'George Coulouris, Jean Dollimore',
      isbn: '978-0132143011',
      rfidTag: 'RFID-006733',
      category: 'Systems & Architecture',
      status: 'Available',
      shelfLocation: 'Stack CS-01-C',
      callNumber: 'QA76.9.D5 C68 2011',
      publisher: 'Addison-Wesley',
      publishYear: 2011,
      edition: '5th Edition',
      borrowCount: 42,
      currentBorrower: null,
      dueDate: null,
      history: []
    },
    {
      id: 'BK-1010',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz, Henry F. Korth',
      isbn: '978-0078022159',
      rfidTag: 'RFID-007822',
      category: 'Data Engineering',
      status: 'Available',
      shelfLocation: 'Stack CS-03-C',
      callNumber: 'QA76.9.D3 S5637 2019',
      publisher: 'McGraw-Hill',
      publishYear: 2019,
      edition: '7th Edition',
      borrowCount: 130,
      currentBorrower: null,
      dueDate: null,
      history: []
    }
  ],

  // Reservations
  reservations: [
    {
      id: 'RES-301',
      bookTitle: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      bookId: 'BK-1004',
      rfidTag: 'RFID-009413',
      studentName: 'Vikas Rao',
      studentId: '21BCS019',
      studentEmail: 'vikas.rao@univ.edu.in',
      reservationDate: '2026-09-28',
      queuePosition: 1,
      status: 'Ready for pickup',
      expiryDate: '2026-10-03'
    },
    {
      id: 'RES-302',
      bookTitle: 'Introduction to Algorithms',
      bookId: 'BK-1006',
      rfidTag: 'RFID-008912',
      studentName: 'Riddhesh Joshi',
      studentId: '22BCE088',
      studentEmail: 'riddhesh.j@univ.edu.in',
      reservationDate: '2026-09-29',
      queuePosition: 1,
      status: 'Waiting',
      expiryDate: '2026-10-06'
    },
    {
      id: 'RES-303',
      bookTitle: 'Introduction to Algorithms',
      bookId: 'BK-1006',
      rfidTag: 'RFID-008912',
      studentName: 'Divya Nair',
      studentId: '22BCE154',
      studentEmail: 'divya.n@univ.edu.in',
      reservationDate: '2026-09-30',
      queuePosition: 2,
      status: 'Waiting',
      expiryDate: '2026-10-07'
    },
    {
      id: 'RES-304',
      bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      bookId: 'BK-1001',
      rfidTag: 'RFID-001284',
      studentName: 'Sanjay Dutt',
      studentId: '21BCS102',
      studentEmail: 'sanjay.d@univ.edu.in',
      reservationDate: '2026-09-20',
      queuePosition: 0,
      status: 'Completed',
      expiryDate: '2026-09-25'
    }
  ],

  // Fines
  fines: [
    {
      id: 'FINE-201',
      studentName: 'Karan Verma',
      studentId: '21BCE041',
      bookTitle: 'The Pragmatic Programmer: Your Journey to Mastery',
      rfidTag: 'RFID-004821',
      dueDate: '2026-09-12',
      returnDate: 'Pending (Overdue)',
      daysOverdue: 19,
      dailyRate: 5, // INR / day academic standard
      calculatedAmount: 95,
      status: 'Outstanding',
      serviceNote: 'Automated overdue fine via fine calculation microservice.'
    },
    {
      id: 'FINE-202',
      studentName: 'Rahul Deshmukh',
      studentId: '20BCE012',
      bookTitle: 'Computer Networks (5th Edition)',
      rfidTag: 'RFID-003112',
      dueDate: '2026-08-10',
      returnDate: '2026-08-25',
      daysOverdue: 15,
      dailyRate: 5,
      calculatedAmount: 75,
      status: 'Paid',
      serviceNote: 'Cleared at Circulation Desk POS.'
    },
    {
      id: 'FINE-203',
      studentName: 'Ananya Sen',
      studentId: '23BCS092',
      bookTitle: 'Operating Systems: Three Easy Pieces',
      rfidTag: 'RFID-001928',
      dueDate: '2026-09-10',
      returnDate: '2026-09-18',
      daysOverdue: 8,
      dailyRate: 5,
      calculatedAmount: 40,
      status: 'Paid',
      serviceNote: 'UPI Payment Verified.'
    },
    {
      id: 'FINE-204',
      studentName: 'Tanya Chopra',
      studentId: '21BCE310',
      bookTitle: 'Discrete Mathematics and Its Applications',
      rfidTag: 'RFID-008104',
      dueDate: '2026-08-30',
      returnDate: 'Pending',
      daysOverdue: 32,
      dailyRate: 5,
      calculatedAmount: 160,
      status: 'Outstanding',
      serviceNote: 'Reminder notice dispatched.'
    }
  ],

  // Gate Security Events
  gateEvents: [
    {
      id: 'EVT-9081',
      time: '10:41:15 AM',
      rfidTag: 'RFID-001284',
      bookTitle: 'Clean Code',
      gateId: 'Gate 01 (Main Pedestrian)',
      event: 'Pedestrian Transit',
      status: 'Authorized',
      detail: 'Valid active circulation record verified by RFID controller.'
    },
    {
      id: 'EVT-9080',
      time: '10:32:04 AM',
      rfidTag: 'RFID-003341',
      bookTitle: 'Compilers: Principles, Techniques, and Tools',
      gateId: 'Gate 01 (Main Pedestrian)',
      event: 'EAS Bit Active',
      status: 'Alert',
      detail: 'SECURITY ALERT: Book has no active issue record. Gate barrier lock engaged.'
    },
    {
      id: 'EVT-9079',
      time: '09:58:22 AM',
      rfidTag: 'RFID-007192',
      bookTitle: 'Computer Networks',
      gateId: 'Gate 02 (Reading Hall)',
      event: 'Transit Verification',
      status: 'Authorized',
      detail: 'Checked out at Self-Return Kiosk.'
    },
    {
      id: 'EVT-9078',
      time: '09:21:40 AM',
      rfidTag: 'RFID-009999',
      bookTitle: 'Unknown Tag Structure',
      gateId: 'Gate 01 (Main Pedestrian)',
      event: 'Collision / CRC Error',
      status: 'RFID Read Error',
      detail: 'Tag CRC checksum mismatch. Signal noise detected.'
    }
  ],

  // Users Directory
  users: [
    {
      id: 'USR-101',
      name: 'Karan Verma',
      studentId: '21BCE041',
      role: 'Student',
      department: 'Computer Science & Engineering',
      email: 'karan.v@univ.edu.in',
      activeLoans: 1,
      reservations: 0,
      status: 'Active',
      joinedYear: 2021
    },
    {
      id: 'USR-102',
      name: 'Sneha Patel',
      studentId: '22BCE209',
      role: 'Student',
      department: 'Computer Science & Engineering',
      email: 'sneha.p@univ.edu.in',
      activeLoans: 1,
      reservations: 0,
      status: 'Active',
      joinedYear: 2022
    },
    {
      id: 'USR-103',
      name: 'Vikas Rao',
      studentId: '21BCS019',
      role: 'Student',
      department: 'Computer Science & Engineering',
      email: 'vikas.rao@univ.edu.in',
      activeLoans: 0,
      reservations: 1,
      status: 'Active',
      joinedYear: 2021
    },
    {
      id: 'USR-201',
      name: 'S. N. Murthy',
      studentId: 'LIB-004',
      role: 'Librarian',
      department: 'Central University Library',
      email: 'murthy.sn@univ.edu.in',
      activeLoans: 0,
      reservations: 0,
      status: 'Active',
      joinedYear: 2014
    },
    {
      id: 'USR-202',
      name: 'Anjali Sharma',
      studentId: 'LIB-008',
      role: 'Librarian',
      department: 'Central University Library',
      email: 'anjali.s@univ.edu.in',
      activeLoans: 0,
      reservations: 0,
      status: 'Active',
      joinedYear: 2019
    },
    {
      id: 'USR-301',
      name: 'Prof. R. Venkatraman',
      studentId: 'ADM-001',
      role: 'Administrator',
      department: 'Department of CSE & IT Services',
      email: 'admin.library@univ.edu.in',
      activeLoans: 0,
      reservations: 0,
      status: 'Active',
      joinedYear: 2010
    }
  ],

  // Stock Verification Status
  stockVerification: {
    totalTags: 340000,
    untraceableBooks: 4100,
    handheldsCount: 6,
    tagsPerMinutePerHandheld: 180,
    estimatedSweepMinutes: 314.8, // 5h 15m
    lastRunDate: '2026-09-18',
    status: 'Ready',
    currentScanCount: 0,
    verifiedCount: 335900,
    missingCount: 4100,
    duplicateCount: 14,
    unregisteredCount: 8,
    handhelds: [
      { id: 'HH-01', name: 'Handheld 01 (Stack A & B)', status: 'Operational', battery: '94%', tagsRead: 56420, operator: 'Staff-A' },
      { id: 'HH-02', name: 'Handheld 02 (Stack C & D)', status: 'Operational', battery: '88%', tagsRead: 57100, operator: 'Staff-B' },
      { id: 'HH-03', name: 'Handheld 03 (Stack E & F)', status: 'Operational', battery: '91%', tagsRead: 54930, operator: 'Staff-C' },
      { id: 'HH-04', name: 'Handheld 04 (Stack G & H)', status: 'Operational', battery: '82%', tagsRead: 56210, operator: 'Staff-D' },
      { id: 'HH-05', name: 'Handheld 05 (Stack I & Reference)', status: 'Operational', battery: '97%', tagsRead: 55800, operator: 'Staff-E' },
      { id: 'HH-06', name: 'Handheld 06 (Periodicals & Storage)', status: 'Operational', battery: '79%', tagsRead: 55440, operator: 'Staff-F' }
    ]
  },

  currentUser: {
    name: 'Academic Demo User',
    role: 'Librarian',
    badge: 'B.Tech CSE Project Mode'
  }
};

class ShelfMindStore {
  constructor() {
    this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.save(DEFAULT_STATE);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or quota exceeded; running with memory state.', e);
    }
  }

  getState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  resetToDefault() {
    this.save(DEFAULT_STATE);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  // --- Convenience Methods ---

  // Digital Licences
  getLicenceSummary() {
    const state = this.getState();
    const active = state.digitalLicences.filter(l => l.status === 'occupied').length;
    const total = state.projectMetrics.maxConcurrentLicences;
    const available = total - active;
    return { total, active, available, licences: state.digitalLicences };
  }

  allocateLicence(userName, userRole, bookTitle, bookId) {
    const state = this.getState();
    const availableSlot = state.digitalLicences.find(l => l.status === 'available');
    if (!availableSlot) {
      return { success: false, reason: 'All 5 concurrent licences are currently in use.' };
    }
    availableSlot.status = 'occupied';
    availableSlot.user = userName || 'Admitted Student';
    availableSlot.role = userRole || 'Student';
    availableSlot.bookTitle = bookTitle || 'Operating System Concepts';
    availableSlot.bookId = bookId || 'EB-101';
    availableSlot.sessionStarted = 'Just now';
    availableSlot.lastActiveMinutesAgo = 0;
    availableSlot.ipAddress = '172.16.14.' + Math.floor(100 + Math.random() * 90);

    this.save(state);
    return { success: true, slot: availableSlot.slot, licence: availableSlot };
  }

  releaseLicence(slotNumber) {
    const state = this.getState();
    const slot = state.digitalLicences.find(l => l.slot === slotNumber);
    if (!slot || slot.status === 'available') {
      return { success: false, reason: 'Slot already available or invalid' };
    }
    const previousUser = slot.user;
    slot.status = 'available';
    slot.user = null;
    slot.role = null;
    slot.bookTitle = null;
    slot.bookId = null;
    slot.sessionStarted = null;
    slot.lastActiveMinutesAgo = null;
    slot.ipAddress = null;

    this.save(state);
    return { success: true, previousUser, slot: slotNumber };
  }

  // Release inactive / idle licences (Simulate 20 min timeout)
  simulateIdleTimeout() {
    const state = this.getState();
    // Find the licence with highest idle time or one that is occupied
    const occupiedLicences = state.digitalLicences.filter(l => l.status === 'occupied');
    if (occupiedLicences.length === 0) {
      return { success: false, reason: 'No active digital licences to time out.' };
    }
    // Pick the most idle licence (e.g. Neha Kulkarni or highest lastActiveMinutesAgo)
    occupiedLicences.sort((a, b) => (b.lastActiveMinutesAgo || 0) - (a.lastActiveMinutesAgo || 0));
    const target = occupiedLicences[0];
    return this.releaseLicence(target.slot);
  }

  // Books
  getBooks() {
    return this.getState().books;
  }

  getBookById(id) {
    const books = this.getBooks();
    return books.find(b => b.id === id || b.rfidTag === id);
  }

  issueBook(rfidTag, studentName, studentId) {
    const state = this.getState();
    const book = state.books.find(b => b.rfidTag === rfidTag || b.id === rfidTag);
    if (!book) return { success: false, reason: 'Book not found with RFID tag.' };
    if (book.status === 'Issued') return { success: false, reason: 'Book is already issued to another patron.' };

    book.status = 'Issued';
    book.borrowCount += 1;
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14); // 14 days digital/physical rule

    book.dueDate = dueDate.toISOString().split('T')[0];
    book.currentBorrower = {
      name: studentName || 'Student (Self-Issue Kiosk)',
      id: studentId || '21BCE041',
      issueDate: today.toISOString().split('T')[0],
      dueDate: book.dueDate
    };
    book.history.unshift({
      date: today.toISOString().split('T')[0],
      user: `${studentName || 'Student'} (${studentId || 'Kiosk'})`,
      action: 'Issued (RFID Station 01)',
      condition: 'Good'
    });

    state.projectMetrics.booksIssuedToday += 1;
    this.save(state);
    return { success: true, book };
  }

  returnBook(rfidTag) {
    const state = this.getState();
    const book = state.books.find(b => b.rfidTag === rfidTag || b.id === rfidTag);
    if (!book) return { success: false, reason: 'Book not found' };
    if (book.status !== 'Issued') return { success: false, reason: 'Book is currently not in Issued state' };

    const todayStr = new Date().toISOString().split('T')[0];
    const prevBorrower = book.currentBorrower ? book.currentBorrower.name : 'Unknown Patron';
    
    // Check overdue
    let overdueDays = 0;
    let fineAmount = 0;
    if (book.dueDate && new Date(book.dueDate) < new Date(todayStr)) {
      const diffTime = Math.abs(new Date(todayStr) - new Date(book.dueDate));
      overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = overdueDays * 5; // 5 INR / day academic standard
    }

    book.status = 'Available';
    book.dueDate = null;
    book.currentBorrower = null;
    book.history.unshift({
      date: todayStr,
      user: prevBorrower,
      action: 'Returned via Smart Chute (RFID Verified)',
      condition: 'Good'
    });

    state.projectMetrics.booksReturnedToday += 1;

    if (overdueDays > 0) {
      state.fines.unshift({
        id: 'FINE-' + Math.floor(205 + Math.random() * 500),
        studentName: prevBorrower,
        studentId: 'AUTO-ID',
        bookTitle: book.title,
        rfidTag: book.rfidTag,
        dueDate: book.dueDate || 'Overdue date',
        returnDate: todayStr,
        daysOverdue: overdueDays,
        dailyRate: 5,
        calculatedAmount: fineAmount,
        status: 'Outstanding',
        serviceNote: 'Automated return ledger fine computation'
      });
      state.projectMetrics.pendingFinesTotal += fineAmount;
    }

    this.save(state);
    return { success: true, book, overdueDays, fineAmount };
  }

  markBookMissing(id) {
    const state = this.getState();
    const book = state.books.find(b => b.id === id || b.rfidTag === id);
    if (!book) return { success: false };
    book.status = 'Missing';
    state.projectMetrics.untraceableBooks += 1;
    this.save(state);
    return { success: true, book };
  }

  addGateEvent(rfidTag, bookTitle, status, detail) {
    const state = this.getState();
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const event = {
      id: 'EVT-' + Math.floor(9100 + Math.random() * 800),
      time: timeStr,
      rfidTag: rfidTag || 'RFID-TAG',
      bookTitle: bookTitle || 'Unknown Volume',
      gateId: 'Gate 01 (Main Pedestrian)',
      event: status === 'Alert' ? 'EAS Security Trip' : 'Transit Verification',
      status: status || 'Authorized',
      detail: detail || 'RFID Gate scan log entry'
    };
    state.gateEvents.unshift(event);
    if (state.gateEvents.length > 25) state.gateEvents.pop();
    this.save(state);
    return event;
  }
}

// Global instance
window.shelfMindStore = new ShelfMindStore();
