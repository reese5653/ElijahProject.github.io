// Firebase Authentication Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore, getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
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
  // Use the named Firestore database requested by project setup
  db = getFirestore(app, 'elijahproject');
  storage = getStorage(app);
  console.log('✓ Firebase initialized successfully with elijahproject database');
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Sign Up
export async function signUp(email, password, username) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Store username in Firestore (fire-and-forget so UI doesn't wait)
  setDoc(doc(db, "users", user.uid), {
    email: user.email,
    username: username,
    createdAt: new Date().toISOString(),
    isAdmin: false
  }, { merge: true }).catch((error) => {
    console.error("Error storing user profile:", error);
  });
  
  return userCredential;
}

// Sign In (also ensure Firestore user doc exists)
export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  // Fire-and-forget the profile write so login UI never waits
  setDoc(doc(db, "users", user.uid), {
    email: user.email || "",
    lastLoginAt: new Date().toISOString()
  }, { merge: true }).catch((error) => {
    console.error("Error ensuring user doc on sign in:", error);
  });
  return credential;
}

// Forgot password
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
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

// Get user's username from Firestore
export async function getUserUsername() {
  const user = getCurrentUser();
  if (!user) return null;
  // Use cached username first to avoid Firestore calls when offline
  const cached = localStorage.getItem(`username_cache_${user.uid}`);
  if (cached) return cached;
  
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const name = userSnap.data().username || user.email;
      localStorage.setItem(`username_cache_${user.uid}`, name);
      return name;
    }
    return user.email;
  } catch (error) {
    console.warn("Could not fetch username (offline?), using email", error?.message || error);
    return user.email;
  }
}

// Ensure Firestore user document exists (runs on login)
export async function ensureUserDocument() {
  const user = getCurrentUser();
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(userRef, {
      email: user.email || "",
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error("Error ensuring user document:", error);
  }
}

// Mark module as completed
export async function markModuleComplete(moduleNumber) {
  // Always save to localStorage first (works without login)
  try {
    localStorage.setItem(`module_${moduleNumber}_completed`, 'true');
    localStorage.setItem(`module_${moduleNumber}_date`, new Date().toISOString());
    console.log(`✓ Module ${moduleNumber} saved to localStorage`, {
      key: `module_${moduleNumber}_completed`,
      value: 'true'
    });
  } catch (e) {
    console.error(`✗ Failed to save to localStorage:`, e);
  }
  
  // Also save to Firebase if logged in
  const user = getCurrentUser();
  if (!user) {
    console.log(`ℹ No user logged in - skipping Firebase save`);
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const completedKey = `module_${moduleNumber}`;
  
  try {
    // Use merge to update or create in one operation - much faster!
    await setDoc(userRef, {
      [completedKey]: true,
      [`${completedKey}_date`]: new Date().toISOString()
    }, { merge: true });
    console.log(`✓ Module ${moduleNumber} saved to Firebase`);
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
  
  for (let i = 1; i <= 19; i++) {
    if (data[`module_${i}`] === true) {
      count++;
    }
  }
  
  return count;
}

// ===== ADMIN FUNCTIONS =====

// List of admin emails (you can modify this)
const ADMIN_EMAILS = [
  "shortcreekimpact@gmail.com",
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

// Mark quiz as completed
export async function markQuizComplete(moduleNumber, lessonNumber) {
  const user = getCurrentUser();
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const quizKey = `module_${moduleNumber}_lesson_${lessonNumber}_quiz`;
  
  try {
    await setDoc(userRef, {
      [quizKey]: true,
      [`${quizKey}_date`]: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error("Error marking quiz complete:", error);
  }
}

// Check if quiz is completed
export async function isQuizCompleted(moduleNumber, lessonNumber) {
  const user = getCurrentUser();
  if (!user) return false;

  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const quizKey = `module_${moduleNumber}_lesson_${lessonNumber}_quiz`;
      return userDoc.data()[quizKey] === true;
    }
    return false;
  } catch (error) {
    console.error("Error checking quiz completion:", error);
    return false;
  }
}

// Real-time listener for user completion updates
export function onCompletionUpdate(callback) {
  const user = getCurrentUser();
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  
  // Use onSnapshot for real-time updates
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  }, (error) => {
    console.error("Error listening to completion updates:", error);
  });
}

// ===== QUIZ SCORES AND RESULTS =====

// Save quiz score with details
export async function saveQuizScore(moduleNumber, lessonNumber, score, totalQuestions, percentage, answers) {
  const user = getCurrentUser();
  if (!user) {
    // Save to localStorage if not logged in
    const quizKey = `quiz_${moduleNumber}_${lessonNumber}`;
    localStorage.setItem(quizKey, JSON.stringify({
      score,
      totalQuestions,
      percentage,
      answers,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const quizKey = `quiz_${moduleNumber}_${lessonNumber}`;

  try {
    await setDoc(userRef, {
      [`${quizKey}_score`]: score,
      [`${quizKey}_total`]: totalQuestions,
      [`${quizKey}_percentage`]: percentage,
      [`${quizKey}_answers`]: answers,
      [`${quizKey}_date`]: new Date().toISOString()
    }, { merge: true });
    console.log(`✓ Quiz score for Module ${moduleNumber} Lesson ${lessonNumber} saved to Firebase`);
  } catch (error) {
    console.error("Error saving quiz score to Firebase:", error);
    throw error; // Re-throw so caller knows it failed
  }
}

// Get quiz score
export async function getQuizScore(moduleNumber, lessonNumber) {
  const user = getCurrentUser();
  
  // Check localStorage first
  const localKey = `quiz_${moduleNumber}_${lessonNumber}`;
  const cached = localStorage.getItem(localKey);
  if (cached) {
    return JSON.parse(cached);
  }

  if (!user) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const quizKey = `quiz_${moduleNumber}_${lessonNumber}`;
      
      if (data[`${quizKey}_score`] !== undefined) {
        return {
          score: data[`${quizKey}_score`],
          totalQuestions: data[`${quizKey}_total`],
          percentage: data[`${quizKey}_percentage`],
          answers: data[`${quizKey}_answers`],
          timestamp: data[`${quizKey}_date`]
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting quiz score:", error);
    return null;
  }
}

// Get all quiz scores for a module
export async function getModuleQuizScores(moduleNumber) {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const scores = [];
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      for (let lesson = 1; lesson <= 10; lesson++) {
        const quizKey = `quiz_${moduleNumber}_${lesson}`;
        if (data[`${quizKey}_score`] !== undefined) {
          scores.push({
            lesson,
            score: data[`${quizKey}_score`],
            totalQuestions: data[`${quizKey}_total`],
            percentage: data[`${quizKey}_percentage`],
            timestamp: data[`${quizKey}_date`]
          });
        }
      }
    }
    
    return scores;
  } catch (error) {
    console.error("Error getting module quiz scores:", error);
    return [];
  }
}

// Real-time listener for quiz scores
export function onQuizScoreUpdate(moduleNumber, lessonNumber, callback) {
  const user = getCurrentUser();
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const quizKey = `quiz_${moduleNumber}_${lessonNumber}`;
      
      if (data[`${quizKey}_score`] !== undefined) {
        callback({
          score: data[`${quizKey}_score`],
          totalQuestions: data[`${quizKey}_total`],
          percentage: data[`${quizKey}_percentage`],
          timestamp: data[`${quizKey}_date`]
        });
      }
    }
  }, (error) => {
    console.error("Error listening to quiz score updates:", error);
  });
}

// ===== USER PROFILE AND PREFERENCES =====

// Update user profile
export async function updateUserProfile(profileData) {
  const user = getCurrentUser();
  if (!user) {
    localStorage.setItem('profile_cache', JSON.stringify(profileData));
    return;
  }

  const userRef = doc(db, "users", user.uid);
  
  try {
    await setDoc(userRef, {
      username: profileData.username,
      fullName: profileData.fullName,
      bio: profileData.bio,
      profileUpdatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✓ Profile updated in Firebase');
  } catch (error) {
    console.error("Error updating profile in Firebase:", error);
    throw error;
  }
}

// Get user profile
export async function getUserProfile() {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        email: data.email,
        username: data.username,
        fullName: data.fullName,
        bio: data.bio,
        createdAt: data.createdAt,
        profileUpdatedAt: data.profileUpdatedAt
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting profile:", error);
    return null;
  }
}

// Update user preferences
export async function updateUserPreferences(preferences) {
  const user = getCurrentUser();
  if (!user) {
    localStorage.setItem('preferences_cache', JSON.stringify(preferences));
    return;
  }

  const userRef = doc(db, "users", user.uid);
  
  try {
    await setDoc(userRef, {
      preferences: {
        theme: preferences.theme || 'light',
        notifications: preferences.notifications !== false,
        language: preferences.language || 'en',
        emailUpdates: preferences.emailUpdates !== false,
        ...preferences
      },
      preferencesUpdatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✓ Preferences updated in Firebase');
  } catch (error) {
    console.error("Error updating preferences in Firebase:", error);
    throw error;
  }
}

// Get user preferences
export async function getUserPreferences() {
  const user = getCurrentUser();
  if (!user) {
    const cached = localStorage.getItem('preferences_cache');
    return cached ? JSON.parse(cached) : { theme: 'light', notifications: true };
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().preferences || { theme: 'light', notifications: true };
    }
    return { theme: 'light', notifications: true };
  } catch (error) {
    console.error("Error getting preferences:", error);
    return { theme: 'light', notifications: true };
  }
}

// ===== COMPREHENSIVE USER DATA SYNC =====

// Get all user data (progress, scores, profile, preferences)
export async function getAllUserData() {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting all user data:", error);
    return null;
  }
}

// Real-time listener for all user data
export function onAllUserDataUpdate(callback) {
  const user = getCurrentUser();
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  }, (error) => {
    console.error("Error listening to all user data updates:", error);
  });
}