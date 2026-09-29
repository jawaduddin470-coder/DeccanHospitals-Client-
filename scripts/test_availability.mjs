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
  orderBy, 
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

async function testAvailabilityAndAdmin() {
  console.log('=== TESTING ADMIN AUTH & AVAILABILITY ===\n');

  // 1. Sign in
  const email = process.env.ADMIN_EMAIL || 'deccancarehospital.24ths@gmail.com';
  const password = process.env.ADMIN_PASSWORD || '';
  if (!password) {
    console.error('ERROR: ADMIN_PASSWORD environment variable not set.');
    process.exit(1);
  }
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const uid = userCredential.user.uid;
  console.log('1. Signed in UID:', uid);

  // 2. Check /admins/{uid} doc
  const adminDocRef = doc(db, 'admins', uid);
  const adminDocSnap = await getDoc(adminDocRef);
  console.log('2. Admin document in /admins/' + uid + ' exists?', adminDocSnap.exists());
  if (adminDocSnap.exists()) {
    console.log('   Admin doc data:', adminDocSnap.data());
  } else {
    console.log('   CREATING /admins/' + uid + ' document now...');
    await setDoc(adminDocRef, {
      uid,
      email: 'deccancarehospital.24ths@gmail.com',
      role: 'superadmin',
      active: true,
      createdAt: new Date().toISOString(),
    });
    console.log('   ✓ /admins/' + uid + ' document created');
  }

  // 3. Test creating a slot in availability
  console.log('\n3. Testing slot creation as admin...');
  const testSlotRef = doc(collection(db, 'availability'));
  try {
    await setDoc(testSlotRef, {
      id: testSlotRef.id,
      doctorId: 'dr-syeda-fatima',
      date: '2026-10-15',
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      status: 'available',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      serverCreatedAt: serverTimestamp(),
    });
    console.log('   ✓ Slot created successfully with id:', testSlotRef.id);
  } catch (err) {
    console.error('   ✗ Slot creation failed:', err);
  }

  // 4. Test query for slots
  console.log('\n4. Testing queries for slots...');
  try {
    const q1 = query(
      collection(db, 'availability'),
      where('doctorId', '==', 'dr-syeda-fatima'),
      where('date', '==', '2026-10-15')
    );
    const snap1 = await getDocs(q1);
    console.log('   ✓ Query with doctorId + date returned docs count:', snap1.size);
  } catch (err) {
    console.error('   ✗ Query with doctorId + date failed:', err);
  }

  // 5. Test query with orderBy startTime (composite index check)
  try {
    const q2 = query(
      collection(db, 'availability'),
      where('doctorId', '==', 'dr-syeda-fatima'),
      where('date', '==', '2026-10-15'),
      orderBy('startTime', 'asc')
    );
    const snap2 = await getDocs(q2);
    console.log('   ✓ Composite query with orderBy returned docs count:', snap2.size);
  } catch (err) {
    console.error('   ✗ Composite query failed:', err.message);
  }

  // Cleanup test slot
  await deleteDoc(testSlotRef);
  console.log('   ✓ Test slot cleaned up\n');
}

testAvailabilityAndAdmin().catch(console.error);
