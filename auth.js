// Firebase Authentication Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXZdoFnEmRbb62c2LwxgCjH6LJ1WhfB1c",
  authDomain: "elijah-project-9c433.firebaseapp.com",
  projectId: "elijah-project-9c433",
  storageBucket: "elijah-project-9c433.firebasestorage.app",
  messagingSenderId: "245457490092",
  appId: "1:245457490092:web:18b1a9ad2b0f7d294d4f09",
  measurementId: "G-PRRVPR95ZW"
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Sign Up
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Sign In
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Sign Out
export function logout() {
  return signOut(auth);
}

// Check Auth State
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get Current User
export function getCurrentUser() {
  return auth.currentUser;
}

// Mark module as completed
export async function markModuleComplete(moduleNumber) {
  const user = getCurrentUser();
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const completedKey = `module_${moduleNumber}`;
  
  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        [completedKey]: true,
        [`${completedKey}_date`]: new Date().toISOString()
      });
    } else {
      await setDoc(userRef, {
        [completedKey]: true,
        [`${completedKey}_date`]: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error marking module complete:", error);
  }
}

// Mark module as incomplete
export async function markModuleIncomplete(moduleNumber) {
  const user = getCurrentUser();
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const completedKey = `module_${moduleNumber}`;
  
  try {
    await updateDoc(userRef, {
      [completedKey]: false
    });
  } catch (error) {
    console.error("Error marking module incomplete:", error);
  }
}

// Get user completion data
export async function getUserCompletionData() {
  const user = getCurrentUser();
  if (!user) return {};

  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return {};
  } catch (error) {
    console.error("Error getting completion data:", error);
    return {};
  }
}

// Get completion count
export async function getCompletionCount() {
  const data = await getUserCompletionData();
  let count = 0;
  
  for (let i = 1; i <= 16; i++) {
    if (data[`module_${i}`] === true) {
      count++;
    }
  }
  
  return count;
}

// ===== ADMIN FUNCTIONS =====

// List of admin emails (you can modify this)
const ADMIN_EMAILS = [
  "admin@elijahprojectschoolofministry.com",
  // Add more admin emails here
];

// Check if current user is admin
export async function isAdmin() {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Check if user email is in admin list
  if (ADMIN_EMAILS.includes(user.email)) {
    return true;
  }
  
  // Check database for admin role
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().isAdmin === true;
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
  }
  
  return false;
}

// Get all users (admin only)
export async function getAllUsers() {
  const usersRef = collection(db, "users");
  const usersSnapshot = await getDocs(usersRef);
  const usersList = [];
  
  usersSnapshot.forEach((doc) => {
    usersList.push({
      uid: doc.id,
      ...doc.data()
    });
  });
  
  return usersList;
}

// Update user data (admin only)
export async function updateUserData(userId, data) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, data);
}

// Delete user data (admin only)
export async function deleteUser(userId) {
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);
}

// Get course data
export async function getCourseData(courseId) {
  const courseRef = doc(db, "courses", courseId);
  const courseDoc = await getDoc(courseRef);
  return courseDoc.exists() ? courseDoc.data() : null;
}

// Get all courses
export async function getAllCourses() {
  const coursesRef = collection(db, "courses");
  const coursesSnapshot = await getDocs(coursesRef);
  const coursesList = [];
  
  coursesSnapshot.forEach((doc) => {
    coursesList.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return coursesList;
}

// Update course data (admin only)
export async function updateCourse(courseId, data) {
  const courseRef = doc(db, "courses", courseId);
  await setDoc(courseRef, data, { merge: true });
}

// Upload file to Firebase Storage (admin only)
export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

// Get analytics data (admin only)
export async function getAnalyticsData() {
  const users = await getAllUsers();
  const totalUsers = users.length;
  let totalCompletions = 0;
  const moduleCompletions = {};
  
  for (let i = 1; i <= 16; i++) {
    moduleCompletions[`module_${i}`] = 0;
  }
  
  users.forEach(user => {
    for (let i = 1; i <= 16; i++) {
      if (user[`module_${i}`] === true) {
        totalCompletions++;
        moduleCompletions[`module_${i}`]++;
      }
    }
  });
  
  return {
    totalUsers,
    totalCompletions,
    moduleCompletions,
    averageCompletionRate: totalUsers > 0 ? (totalCompletions / (totalUsers * 16) * 100).toFixed(2) : 0
  };
}

// Mark user as admin (super admin only)
export async function setAdminRole(userId, isAdmin) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { isAdmin });
}
