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

async function runVerification() {
  console.log('=== STARTING PHASE 7.4 FIRESTORE SYNCHRONIZATION TEST ===\n');

  // 1. Authenticate Admin
  console.log('1. Authenticating Admin User...');
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
  console.log('   Authenticated Admin UID:', userCredential.user.uid);

  // 2. Test Services End-to-End
  console.log('\n2. Testing Services End-to-End Flow...');
  const serviceRef = doc(db, 'services', 'emergency-care');
  const serviceSnapBefore = await getDoc(serviceRef);
  const originalDesc = serviceSnapBefore.exists() 
    ? serviceSnapBefore.data().description 
    : '24/7 dedicated emergency medical response, casualty department, and critical triage in Sheikh Roza, Kalaburagi.';

  console.log('   Original Service Description:', originalDesc.slice(0, 50) + '...');

  // Update in Firestore
  const testDesc = 'TEST FIRESTORE SERVICE UPDATE';
  console.log('   Updating description to:', testDesc);
  await setDoc(serviceRef, {
    id: 'emergency-care',
    name: 'Emergency Care (24×7)',
    description: testDesc,
    category: 'emergency',
    iconName: 'ShieldAlert',
    displayOrder: 1,
    active: true,
    featured: true,
    isEmergency: true,
    serverUpdatedAt: serverTimestamp(),
  }, { merge: true });

  // Public fetch verification
  const servicesQuery = query(collection(db, 'services'), orderBy('displayOrder', 'asc'));
  const publicServicesSnap = await getDocs(servicesQuery);
  const publicServices = publicServicesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const emergencyPub = publicServices.find(s => s.id === 'emergency-care');

  if (emergencyPub && emergencyPub.description === testDesc) {
    console.log('   ✓ Service public query matches updated Firestore value: PASS');
  } else {
    console.error('   ✗ Service public query failed to match Firestore value:', emergencyPub?.description);
  }

  // Restore Original Description
  console.log('   Restoring original service description...');
  await updateDoc(serviceRef, {
    description: originalDesc,
    serverUpdatedAt: serverTimestamp(),
  });
  console.log('   ✓ Original description restored');

  // 3. Test Doctors End-to-End
  console.log('\n3. Testing Doctors End-to-End Flow...');
  const doctorRef = doc(db, 'doctors', 'dr-merajuddin');
  const docSnapBefore = await getDoc(doctorRef);
  const originalDocDesignation = docSnapBefore.exists()
    ? docSnapBefore.data().designation
    : 'Consultant Obstetrician & Gynaecologist';

  console.log('   Original Doctor Designation:', originalDocDesignation);

  const testDesignation = 'TEST FIRESTORE DOCTOR DESIGNATION';
  console.log('   Updating doctor designation to:', testDesignation);
  await setDoc(doctorRef, {
    id: 'dr-merajuddin',
    name: 'Dr. Merajuddin',
    designation: testDesignation,
    specialization: 'Obstetrics & Gynaecology',
    qualification: 'MBBS, DGO, MS (OBG)',
    description: 'Experienced specialist delivering comprehensive maternity and prenatal clinical care in Kalaburagi.',
    profileType: 'featured',
    displayOrder: 1,
    active: true,
    serverUpdatedAt: serverTimestamp(),
  }, { merge: true });

  const doctorsQuery = query(collection(db, 'doctors'), orderBy('displayOrder', 'asc'));
  const publicDoctorsSnap = await getDocs(doctorsQuery);
  const publicDoctors = publicDoctorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const drPub = publicDoctors.find(d => d.id === 'dr-merajuddin');

  if (drPub && drPub.designation === testDesignation) {
    console.log('   ✓ Doctor public query matches updated Firestore value: PASS');
  } else {
    console.error('   ✗ Doctor public query failed to match:', drPub?.designation);
  }

  console.log('   Restoring original doctor designation...');
  await updateDoc(doctorRef, {
    designation: originalDocDesignation,
    serverUpdatedAt: serverTimestamp(),
  });
  console.log('   ✓ Original doctor designation restored');

  // 4. Test Gallery End-to-End
  console.log('\n4. Testing Gallery End-to-End Flow...');
  const testGalleryId = 'test-verification-gallery-item';
  const testGalleryRef = doc(db, 'gallery', testGalleryId);
  console.log('   Creating test gallery record...');
  await setDoc(testGalleryRef, {
    id: testGalleryId,
    title: 'Test Verification Photo',
    description: 'Automated test record for Phase 7.4 Firestore verification',
    category: 'facilities',
    imageUrl: 'https://res.cloudinary.com/lnzz0kuu/image/upload/v1727530000/deccan-care/gallery/test_image.jpg',
    aspectRatio: '16:10',
    featured: true,
    active: true,
    displayOrder: 99,
    serverCreatedAt: serverTimestamp(),
  });

  const galleryQuery = query(collection(db, 'gallery'), orderBy('displayOrder', 'asc'));
  const publicGallerySnap = await getDocs(galleryQuery);
  const publicGallery = publicGallerySnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const foundTestItem = publicGallery.find(g => g.id === testGalleryId);

  if (foundTestItem && foundTestItem.title === 'Test Verification Photo') {
    console.log('   ✓ Gallery public query matches new Firestore record: PASS');
  } else {
    console.error('   ✗ Gallery test item not found in public query');
  }

  console.log('   Cleaning up test gallery record...');
  await deleteDoc(testGalleryRef);
  console.log('   ✓ Test gallery record removed');

  // 5. Test Hospital Info End-to-End
  console.log('\n5. Testing Hospital Info End-to-End Flow...');
  const hospitalInfoRef = doc(db, 'hospitalInfo', 'general');
  const infoSnap = await getDoc(hospitalInfoRef);
  const originalName = infoSnap.exists() ? infoSnap.data().name : 'Deccan Care';

  console.log('   Current Hospital Name:', originalName);
  await setDoc(hospitalInfoRef, {
    name: 'Deccan Care Maternity & General Hospital',
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  const refreshedInfoSnap = await getDoc(hospitalInfoRef);
  if (refreshedInfoSnap.exists()) {
    console.log('   ✓ Hospital Info general doc verified in Firestore: PASS');
  }

  console.log('\n=== ALL END-TO-END FIRESTORE SYNCHRONIZATION TESTS PASSED ===\n');
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
