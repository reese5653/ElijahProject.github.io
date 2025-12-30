// Firebase Authentication Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
