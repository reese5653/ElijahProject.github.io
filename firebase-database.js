// Firebase Database Module for Elijah Project
// Handles all cross-platform data persistence for users, courses, progress, and quizzes

import { doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc, query, where, onSnapshot, arrayUnion, arrayRemove, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getCurrentUser, getDb } from "./auth.js";

const db = getDb();

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

/**
 * Update user profile information
 * @param {Object} profileData - Profile fields to update (bio, phone, etc.)
 */
export async function updateUserProfile(profileData) {
  const user = getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    console.log("✓ User profile updated");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Get full user profile data
 */
export async function getUserProfile() {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

/**
 * Listen for real-time user profile changes
 */
export function listenToUserProfile(callback) {
  const user = getCurrentUser();
  if (!user) return () => {};

  const userRef = doc(db, "users", user.uid);
  return onSnapshot(userRef, (doc) => {
    callback(doc.exists() ? doc.data() : null);
  });
}

// ============================================
// COURSE & MODULE PROGRESS
// ============================================

/**
 * Save user progress for a specific module
 * @param {number} moduleNumber - Module number (1-19)
 * @param {Object} progressData - Progress details (currentLesson, timeSpent, etc.)
 */
export async function saveModuleProgress(moduleNumber, progressData) {
  const user = getCurrentUser();
  if (!user) {
    // Save to localStorage for offline users
    localStorage.setItem(`module_${moduleNumber}_progress`, JSON.stringify(progressData));
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      [`modules.${moduleNumber}`]: {
        ...progressData,
        lastUpdated: serverTimestamp(),
        moduleNumber: moduleNumber
      }
    });
    console.log(`✓ Module ${moduleNumber} progress saved`);
  } catch (error) {
    console.error("Error saving module progress:", error);
    // Fallback to localStorage
    localStorage.setItem(`module_${moduleNumber}_progress`, JSON.stringify(progressData));
  }
}

/**
 * Get progress for a specific module
 */
export async function getModuleProgress(moduleNumber) {
  const user = getCurrentUser();
  if (!user) {
    const cached = localStorage.getItem(`module_${moduleNumber}_progress`);
    return cached ? JSON.parse(cached) : null;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().modules?.[moduleNumber] || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting module progress:", error);
    return null;
  }
}

/**
 * Get all module progress data
 */
export async function getAllModuleProgress() {
  const user = getCurrentUser();
  if (!user) return {};

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().modules || {} : {};
  } catch (error) {
    console.error("Error getting all module progress:", error);
    return {};
  }
}

/**
 * Mark module as completed
 */
export async function completeModule(moduleNumber) {
  const user = getCurrentUser();
  if (!user) {
    localStorage.setItem(`module_${moduleNumber}_completed`, 'true');
    localStorage.setItem(`module_${moduleNumber}_completedDate`, new Date().toISOString());
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      [`modules.${moduleNumber}.completed`]: true,
      [`modules.${moduleNumber}.completedDate`]: serverTimestamp(),
      [`modules.${moduleNumber}.lastUpdated`]: serverTimestamp()
    });
    console.log(`✓ Module ${moduleNumber} marked as completed`);
  } catch (error) {
    console.error("Error completing module:", error);
  }
}

/**
 * Get count of completed modules
 */
export async function getCompletedModuleCount() {
  const user = getCurrentUser();
  if (!user) return 0;

  try {
    const modules = await getAllModuleProgress();
    return Object.values(modules).filter(m => m.completed).length;
  } catch (error) {
    console.error("Error getting completed module count:", error);
    return 0;
  }
}

// ============================================
// QUIZ & ASSESSMENT DATA
// ============================================

/**
 * Save quiz responses and score
 * @param {number} moduleNumber - Module number
 * @param {number} weekNumber - Week number (if applicable)
 * @param {Object} quizData - Quiz responses and results
 */
export async function saveQuizResponse(moduleNumber, weekNumber, quizData) {
  const user = getCurrentUser();
  if (!user) {
    localStorage.setItem(`quiz_module${moduleNumber}_week${weekNumber}`, JSON.stringify(quizData));
    return;
  }

  try {
    const quizzesRef = doc(db, "users", user.uid, "quizzes", `module_${moduleNumber}_week_${weekNumber}`);
    await setDoc(quizzesRef, {
      moduleNumber: moduleNumber,
      weekNumber: weekNumber,
      ...quizData,
      submittedAt: serverTimestamp(),
      userId: user.uid
    }, { merge: true });
    console.log(`✓ Quiz response saved for Module ${moduleNumber} Week ${weekNumber}`);
  } catch (error) {
    console.error("Error saving quiz response:", error);
    localStorage.setItem(`quiz_module${moduleNumber}_week${weekNumber}`, JSON.stringify(quizData));
  }
}

/**
 * Get quiz response for a specific module/week
 */
export async function getQuizResponse(moduleNumber, weekNumber) {
  const user = getCurrentUser();
  if (!user) {
    const cached = localStorage.getItem(`quiz_module${moduleNumber}_week${weekNumber}`);
    return cached ? JSON.parse(cached) : null;
  }

  try {
    const quizzesRef = doc(db, "users", user.uid, "quizzes", `module_${moduleNumber}_week_${weekNumber}`);
    const quizSnap = await getDoc(quizzesRef);
    return quizSnap.exists() ? quizSnap.data() : null;
  } catch (error) {
    console.error("Error getting quiz response:", error);
    return null;
  }
}

/**
 * Get all quiz responses for a user
 */
export async function getAllQuizResponses() {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const quizzesRef = collection(db, "users", user.uid, "quizzes");
    const quizzesSnap = await getDocs(quizzesRef);
    return quizzesSnap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting all quiz responses:", error);
    return [];
  }
}

/**
 * Save quiz draft (in-progress quiz)
 */
export async function saveQuizDraft(moduleNumber, weekNumber, draftData) {
  const user = getCurrentUser();
  if (!user) {
    localStorage.setItem(`quiz_draft_module${moduleNumber}_week${weekNumber}`, JSON.stringify(draftData));
    return;
  }

  try {
    const draftRef = doc(db, "users", user.uid, "quizDrafts", `module_${moduleNumber}_week_${weekNumber}`);
    await setDoc(draftRef, {
      moduleNumber: moduleNumber,
      weekNumber: weekNumber,
      ...draftData,
      savedAt: serverTimestamp(),
      userId: user.uid
    }, { merge: true });
  } catch (error) {
    console.error("Error saving quiz draft:", error);
    localStorage.setItem(`quiz_draft_module${moduleNumber}_week${weekNumber}`, JSON.stringify(draftData));
  }
}

/**
 * Get quiz draft
 */
export async function getQuizDraft(moduleNumber, weekNumber) {
  const user = getCurrentUser();
  if (!user) {
    const cached = localStorage.getItem(`quiz_draft_module${moduleNumber}_week${weekNumber}`);
    return cached ? JSON.parse(cached) : null;
  }

  try {
    const draftRef = doc(db, "users", user.uid, "quizDrafts", `module_${moduleNumber}_week_${weekNumber}`);
    const draftSnap = await getDoc(draftRef);
    return draftSnap.exists() ? draftSnap.data() : null;
  } catch (error) {
    console.error("Error getting quiz draft:", error);
    return null;
  }
}

// ============================================
// BOOKMARKS & SAVED CONTENT
// ============================================

/**
 * Save a bookmark (e.g., important lesson, resource)
 */
export async function addBookmark(bookmarkData) {
  const user = getCurrentUser();
  if (!user) {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    bookmarks.push({ ...bookmarkData, id: Date.now() });
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    return;
  }

  try {
    const bookmarkRef = doc(db, "users", user.uid, "bookmarks", bookmarkData.id || `bookmark_${Date.now()}`);
    await setDoc(bookmarkRef, {
      ...bookmarkData,
      createdAt: serverTimestamp(),
      userId: user.uid
    });
    console.log("✓ Bookmark saved");
  } catch (error) {
    console.error("Error saving bookmark:", error);
  }
}

/**
 * Get all bookmarks for user
 */
export async function getBookmarks() {
  const user = getCurrentUser();
  if (!user) {
    return JSON.parse(localStorage.getItem("bookmarks") || "[]");
  }

  try {
    const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
    const bookmarksSnap = await getDocs(bookmarksRef);
    return bookmarksSnap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting bookmarks:", error);
    return [];
  }
}

/**
 * Remove a bookmark
 */
export async function removeBookmark(bookmarkId) {
  const user = getCurrentUser();
  if (!user) {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    const filtered = bookmarks.filter(b => b.id !== bookmarkId);
    localStorage.setItem("bookmarks", JSON.stringify(filtered));
    return;
  }

  try {
    const bookmarkRef = doc(db, "users", user.uid, "bookmarks", bookmarkId);
    await deleteDoc(bookmarkRef);
    console.log("✓ Bookmark removed");
  } catch (error) {
    console.error("Error removing bookmark:", error);
  }
}

// ============================================
// NOTES & PERSONAL ANNOTATIONS
// ============================================

/**
 * Save user notes for a lesson
 */
export async function saveNotes(moduleNumber, weekNumber, noteContent) {
  const user = getCurrentUser();
  if (!user) {
    localStorage.setItem(`notes_module${moduleNumber}_week${weekNumber}`, noteContent);
    return;
  }

  try {
    const notesRef = doc(db, "users", user.uid, "notes", `module_${moduleNumber}_week_${weekNumber}`);
    await setDoc(notesRef, {
      moduleNumber: moduleNumber,
      weekNumber: weekNumber,
      content: noteContent,
      updatedAt: serverTimestamp(),
      userId: user.uid
    }, { merge: true });
    console.log("✓ Notes saved");
  } catch (error) {
    console.error("Error saving notes:", error);
    localStorage.setItem(`notes_module${moduleNumber}_week${weekNumber}`, noteContent);
  }
}

/**
 * Get user notes for a lesson
 */
export async function getNotes(moduleNumber, weekNumber) {
  const user = getCurrentUser();
  if (!user) {
    return localStorage.getItem(`notes_module${moduleNumber}_week${weekNumber}`) || "";
  }

  try {
    const notesRef = doc(db, "users", user.uid, "notes", `module_${moduleNumber}_week_${weekNumber}`);
    const notesSnap = await getDoc(notesRef);
    return notesSnap.exists() ? notesSnap.data().content : "";
  } catch (error) {
    console.error("Error getting notes:", error);
    return "";
  }
}

/**
 * Get all notes for user
 */
export async function getAllNotes() {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const notesRef = collection(db, "users", user.uid, "notes");
    const notesSnap = await getDocs(notesRef);
    return notesSnap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting all notes:", error);
    return [];
  }
}

// ============================================
// USER SETTINGS & PREFERENCES
// ============================================

/**
 * Save user preferences (notifications, language, etc.)
 */
export async function saveUserSettings(settings) {
  const user = getCurrentUser();
  if (!user) {
    localStorage.setItem("userSettings", JSON.stringify(settings));
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      settings: {
        ...settings,
        updatedAt: serverTimestamp()
      }
    });
    console.log("✓ User settings saved");
  } catch (error) {
    console.error("Error saving user settings:", error);
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }
}

/**
 * Get user settings
 */
export async function getUserSettings() {
  const user = getCurrentUser();
  if (!user) {
    return JSON.parse(localStorage.getItem("userSettings") || "{}");
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().settings || {} : {};
  } catch (error) {
    console.error("Error getting user settings:", error);
    return {};
  }
}

// ============================================
// CERTIFICATES & ACHIEVEMENTS
// ============================================

/**
 * Award certificate when user completes a module
 */
export async function awardCertificate(moduleNumber, certificateData) {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const certificateRef = doc(db, "users", user.uid, "certificates", `module_${moduleNumber}`);
    await setDoc(certificateRef, {
      moduleNumber: moduleNumber,
      awardedAt: serverTimestamp(),
      ...certificateData,
      userId: user.uid
    });
    console.log(`✓ Certificate awarded for Module ${moduleNumber}`);
  } catch (error) {
    console.error("Error awarding certificate:", error);
  }
}

/**
 * Get user's certificates
 */
export async function getCertificates() {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const certificatesRef = collection(db, "users", user.uid, "certificates");
    const certificatesSnap = await getDocs(certificatesRef);
    return certificatesSnap.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting certificates:", error);
    return [];
  }
}

// ============================================
// STUDY STREAK & ANALYTICS
// ============================================

/**
 * Record a study session
 */
export async function recordStudySession(sessionData) {
  const user = getCurrentUser();
  if (!user) {
    const sessions = JSON.parse(localStorage.getItem("studySessions") || "[]");
    sessions.push(sessionData);
    localStorage.setItem("studySessions", JSON.stringify(sessions));
    return;
  }

  try {
    const sessionRef = doc(db, "users", user.uid, "studySessions", `session_${Date.now()}`);
    await setDoc(sessionRef, {
      ...sessionData,
      recordedAt: serverTimestamp(),
      userId: user.uid
    });
    console.log("✓ Study session recorded");
  } catch (error) {
    console.error("Error recording study session:", error);
  }
}

/**
 * Get user study analytics
 */
export async function getStudyAnalytics(daysBack = 30) {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    const sessionsRef = collection(db, "users", user.uid, "studySessions");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const q = query(sessionsRef, where("recordedAt", ">=", startDate));
    const sessionsSnap = await getDocs(q);
    
    const sessions = sessionsSnap.docs.map(doc => doc.data());
    
    // Calculate analytics
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalSessions = sessions.length;
    
    return {
      totalMinutes,
      totalSessions,
      averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      lastSessionDate: sessions.length > 0 ? sessions[0].recordedAt : null
    };
  } catch (error) {
    console.error("Error getting study analytics:", error);
    return null;
  }
}

// ============================================
// BATCH OPERATIONS (for syncing across devices)
// ============================================

/**
 * Sync all local data to Firebase when connection is restored
 */
export async function syncLocalDataToFirebase() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    // Sync module progress
    for (let i = 1; i <= 19; i++) {
      const cached = localStorage.getItem(`module_${i}_progress`);
      if (cached) {
        await saveModuleProgress(i, JSON.parse(cached));
        localStorage.removeItem(`module_${i}_progress`);
      }
    }

    // Sync quiz responses
    for (let i = 1; i <= 19; i++) {
      for (let w = 1; w <= 4; w++) {
        const cached = localStorage.getItem(`quiz_module${i}_week${w}`);
        if (cached) {
          await saveQuizResponse(i, w, JSON.parse(cached));
          localStorage.removeItem(`quiz_module${i}_week${w}`);
        }
      }
    }

    // Sync notes
    for (let i = 1; i <= 19; i++) {
      for (let w = 1; w <= 4; w++) {
        const notes = localStorage.getItem(`notes_module${i}_week${w}`);
        if (notes) {
          await saveNotes(i, w, notes);
          localStorage.removeItem(`notes_module${i}_week${w}`);
        }
      }
    }

    console.log("✓ All local data synced to Firebase");
  } catch (error) {
    console.error("Error syncing local data:", error);
  }
}

/**
 * Export all user data (GDPR compliance)
 */
export async function exportUserData() {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    const quizzes = await getAllQuizResponses();
    const certificates = await getCertificates();
    const notes = await getAllNotes();
    const bookmarks = await getBookmarks();

    const exportData = {
      user: userSnap.data(),
      quizzes,
      certificates,
      notes,
      bookmarks,
      exportedAt: new Date().toISOString()
    };

    return exportData;
  } catch (error) {
    console.error("Error exporting user data:", error);
    return null;
  }
}

/**
 * Delete all user data (account deletion)
 */
export async function deleteAllUserData() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    
    // Delete subcollections
    const collections = ["quizzes", "quizDrafts", "notes", "bookmarks", "certificates", "studySessions"];
    
    for (const collectionName of collections) {
      const collectionRef = collection(db, "users", user.uid, collectionName);
      const docs = await getDocs(collectionRef);
      for (const docSnap of docs.docs) {
        await deleteDoc(docSnap.ref);
      }
    }
    
    // Delete user document
    await deleteDoc(userRef);
    console.log("✓ All user data deleted");
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
}
