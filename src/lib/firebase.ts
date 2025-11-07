import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp, getDocs, query, orderBy, limit, where, updateDoc, deleteDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA065XG19Wf6rp1eW5UOdBl4YCpnfMegc",
  authDomain: "messager-4abd8.firebaseapp.com",
  databaseURL: "https://messager-4abd8.firebaseio.com",
  projectId: "messager-4abd8",
  storageBucket: "messager-4abd8.appspot.com",
  messagingSenderId: "650985879545",
  appId: "1:650985879545:web:cd3edd8825090a3a40af28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Test write permissions by creating a simple document
async function testWritePermissions() {
  try {
    const testRef = doc(db, 'test', 'permissions');
    await setDoc(testRef, {
      message: 'Testing write permissions',
      timestamp: serverTimestamp()
    });
    console.log('✅ Write permissions test passed');
    return true;
  } catch (error) {
    console.error('❌ Write permissions test failed:', error);
    return false;
  }
}

// Create initial data with proper error handling
async function createInitialData() {
  console.log('🌱 Starting database initialization...');
  
  // Test write permissions first
  const hasWritePermission = await testWritePermissions();
  if (!hasWritePermission) {
    console.error('❌ Cannot proceed without write permissions');
    return false;
  }

  try {
    // Create categories
    const categories = [
      { name: 'HTML Fundamentals', description: 'Learn the basics of HTML structure and tags', icon: '📄', color: 'bg-orange-100 text-orange-800' },
      { name: 'CSS Styling', description: 'Master CSS styling, layouts, and responsive design', icon: '🎨', color: 'bg-blue-100 text-blue-800' },
      { name: 'JavaScript Basics', description: 'Learn programming fundamentals with JavaScript', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
      { name: 'React & Next.js', description: 'Build modern web apps with React and Next.js', icon: '⚛️', color: 'bg-cyan-100 text-cyan-800' }
    ];

    for (const category of categories) {
      const categoryRef = doc(db, 'categories', category.name.toLowerCase().replace(/\s+/g, '-'));
      await setDoc(categoryRef, {
        ...category,
        createdAt: serverTimestamp()
      });
      console.log(`✅ Created category: ${category.name}`);
    }

    // Create a test admin user
    const adminUserRef = doc(db, 'users', 'admin-user');
    await setDoc(adminUserRef, {
      uid: 'admin-user',
      email: 'admin@trainme.com',
      displayName: 'Admin User',
      totalXp: 5000,
      level: 50,
      streak: 100,
      isAdmin: true,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
    console.log('✅ Created admin user');

    // Create a test regular user
    const testUserRef = doc(db, 'users', 'test-user');
    await setDoc(testUserRef, {
      uid: 'test-user',
      email: 'user@trainme.com',
      displayName: 'Test User',
      totalXp: 250,
      level: 3,
      streak: 5,
      isAdmin: false,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
    console.log('✅ Created test user');

    console.log('🎉 Database initialization completed!');
    return true;

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
}

// Export functions for use in the app
export { createInitialData, testWritePermissions };
