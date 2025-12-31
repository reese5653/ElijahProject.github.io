// Firebase Authentication Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
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
