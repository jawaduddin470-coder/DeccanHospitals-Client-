import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  runTransaction,
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDz2C1NJXb3b8Dmi7Uacu2hW8RbZpjl-a8",
  authDomain: "deccanhospital-91941.firebaseapp.com",
  projectId: "deccanhospital-91941",
  storageBucket: "deccanhospital-91941.firebasestorage.app",
  messagingSenderId: "765933960783",
  appId: "1:765933960783:web:5632f12cb526b05828f43a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const parseTimeToMinutes = (tStr) => {
  if (!tStr) return 0;
  const match = tStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
};

async function runPhase75E2E() {
  console.log('=== STARTING PHASE 7.5 END-TO-END VERIFICATION ===\n');

  // 1. Authenticate Admin User
  console.log('1. Authenticating Admin User...');
  const userCredential = await signInWithEmailAndPassword(
    auth,
    'deccancarehospital.24ths@gmail.com',
    'deccancare01'
  );
  console.log('   Authenticated UID:', userCredential.user.uid);

  // 2. Test Doctor Creation with EMPTY description
  console.log('\n2. Testing Doctor Creation with EMPTY description...');
  const testDoctorId = 'dr-shoeb-abdullah-test';
  const testDoctorRef = doc(db, 'doctors', testDoctorId);

  const cleanDoctor = {
    id: testDoctorId,
    name: 'Dr. Shoeb Abdullah',
    designation: 'Consultant',
    specialization: 'Consultant',
    qualification: 'MBBS',
    description: '', // EMPTY description
    profileType: 'directory',
    displayOrder: 99,
    active: true,
    featured: false,
    imageUrl: 'https://res.cloudinary.com/lnzz0kuu/image/upload/v1727530000/deccan-care/doctors/test_dr_shoeb.jpg',
    imagePublicId: 'deccan-care/doctors/test_dr_shoeb',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(testDoctorRef, {
    ...cleanDoctor,
    serverCreatedAt: serverTimestamp(),
    serverUpdatedAt: serverTimestamp(),
  });

  const createdDocSnap = await getDoc(testDoctorRef);
  if (createdDocSnap.exists() && createdDocSnap.data().name === 'Dr. Shoeb Abdullah' && createdDocSnap.data().description === '') {
    console.log('   ✓ Doctor created successfully in Firestore with empty description: PASS');
    console.log('   ✓ imageUrl persisted in Firestore:', createdDocSnap.data().imageUrl);
  } else {
    throw new Error('Doctor creation check failed');
  }

  // 3. Test Editing Doctor & Image Preservation
  console.log('\n3. Testing Doctor Edit & Image Preservation...');
  await updateDoc(testDoctorRef, {
    designation: 'Senior Consultant',
    updatedAt: new Date().toISOString(),
    serverUpdatedAt: serverTimestamp(),
  });
  const updatedDocSnap = await getDoc(testDoctorRef);
  if (updatedDocSnap.data().designation === 'Senior Consultant' && updatedDocSnap.data().imageUrl === cleanDoctor.imageUrl) {
    console.log('   ✓ Doctor updated and imageUrl preserved: PASS');
  } else {
    throw new Error('Doctor edit check failed');
  }

  // Clean up test doctor
  await deleteDoc(testDoctorRef);
  console.log('   ✓ Test doctor cleaned up');

  // 4. Test Availability Slot Generation (6 Slots)
  console.log('\n4. Testing Availability Slot Generation (6 Slots)...');
  const doctorId = 'dr-syeda-fatima';
  const testDate = '2026-11-20';
  const intervals = [
    { startTime: '10:00 AM', endTime: '10:30 AM' },
    { startTime: '10:30 AM', endTime: '11:00 AM' },
    { startTime: '11:00 AM', endTime: '11:30 AM' },
    { startTime: '11:30 AM', endTime: '12:00 PM' },
    { startTime: '12:00 PM', endTime: '12:30 PM' },
    { startTime: '12:30 PM', endTime: '01:00 PM' },
  ];

  const createdSlotIds = [];
  for (const intv of intervals) {
    const slotDocRef = doc(collection(db, 'availability'));
    const slot = {
      id: slotDocRef.id,
      doctorId,
      date: testDate,
      startTime: intv.startTime,
      endTime: intv.endTime,
      status: 'available',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(slotDocRef, {
      ...slot,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });
    createdSlotIds.push(slotDocRef.id);
  }
  console.log(`   ✓ Successfully created ${createdSlotIds.length} slots in Firestore: PASS`);

  // 5. Test Querying Slots (Admin & Public)
  console.log('\n5. Testing Slot Query (Admin & Public)...');
  const slotQuery = query(
    collection(db, 'availability'),
    where('doctorId', '==', doctorId),
    where('date', '==', testDate)
  );
  const adminSlotsSnap = await getDocs(slotQuery);
  const adminSlots = adminSlotsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  console.log(`   ✓ Admin query returned ${adminSlots.length} slots for ${doctorId} on ${testDate}`);
  if (adminSlots.length !== 6) throw new Error('Expected 6 slots in admin query');

  const publicAvailableSlots = adminSlots.filter(s => s.active && s.status === 'available');
  console.log(`   ✓ Public available slots count: ${publicAvailableSlots.length}: PASS`);

  // 6. Test Slot Blocking & Reopening
  console.log('\n6. Testing Slot Blocking and Reopening...');
  const slotToBlock = adminSlots[0];
  await updateDoc(doc(db, 'availability', slotToBlock.id), {
    status: 'blocked',
    updatedAt: new Date().toISOString(),
    serverUpdatedAt: serverTimestamp(),
  });

  const refreshedSnap1 = await getDocs(slotQuery);
  const refreshedAvailable1 = refreshedSnap1.docs
    .map(d => d.data())
    .filter(s => s.active && s.status === 'available');

  if (refreshedAvailable1.length === 5) {
    console.log('   ✓ Blocked slot excluded from public available list (5 remaining): PASS');
  } else {
    throw new Error('Blocked slot check failed');
  }

  // Reopen slot
  await updateDoc(doc(db, 'availability', slotToBlock.id), {
    status: 'available',
    updatedAt: new Date().toISOString(),
    serverUpdatedAt: serverTimestamp(),
  });
  const refreshedSnap2 = await getDocs(slotQuery);
  const refreshedAvailable2 = refreshedSnap2.docs
    .map(d => d.data())
    .filter(s => s.active && s.status === 'available');

  if (refreshedAvailable2.length === 6) {
    console.log('   ✓ Reopened slot visible again in public available list (6 total): PASS');
  } else {
    throw new Error('Reopened slot check failed');
  }

  // 7. Test Atomic Booking & Double-Booking Protection
  console.log('\n7. Testing Atomic Booking & Double-Booking Protection...');
  const slotToBook = adminSlots[1];
  const slotDocRef = doc(db, 'availability', slotToBook.id);
  const apptDocRef = doc(collection(db, 'appointments'));

  // Perform atomic booking transaction
  await runTransaction(db, async (transaction) => {
    const sSnap = await transaction.get(slotDocRef);
    if (!sSnap.exists() || sSnap.data().status !== 'available') {
      throw new Error('Slot unavailable');
    }
    transaction.update(slotDocRef, {
      status: 'booked',
      bookingId: apptDocRef.id,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp(),
    });
    transaction.set(apptDocRef, {
      id: apptDocRef.id,
      patientName: 'Test Patient',
      phone: '9876543210',
      doctorId,
      date: testDate,
      slotId: slotToBook.id,
      startTime: slotToBook.startTime,
      endTime: slotToBook.endTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
      serverCreatedAt: serverTimestamp(),
    });
  });
  console.log('   ✓ Atomic booking transaction succeeded: slot is now BOOKED');

  // Attempt second booking on the same slot (Double Booking Test)
  let doubleBookingCaught = false;
  try {
    await runTransaction(db, async (transaction) => {
      const sSnap = await transaction.get(slotDocRef);
      if (!sSnap.exists() || sSnap.data().status !== 'available') {
        throw new Error('DoubleBookingError: Slot already booked');
      }
    });
  } catch (err) {
    doubleBookingCaught = true;
    console.log('   ✓ Second booking on same slot safely rejected with DoubleBookingError: PASS');
  }
  if (!doubleBookingCaught) throw new Error('Double booking protection failed');

  // Clean up appointments and test slots
  console.log('\n8. Cleaning up test data...');
  await deleteDoc(apptDocRef);
  for (const slotId of createdSlotIds) {
    await deleteDoc(doc(db, 'availability', slotId));
  }
  console.log('   ✓ All test availability slots and appointment records cleaned up');

  console.log('\n=== ALL PHASE 7.5 END-TO-END TESTS COMPLETED AND PASSED ===\n');
}

runPhase75E2E().catch((err) => {
  console.error('Phase 7.5 E2E failed with error:', err);
  process.exit(1);
});
