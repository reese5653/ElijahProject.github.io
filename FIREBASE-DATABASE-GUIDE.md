# Firebase Database Guide for Elijah Project

## Overview

This guide explains how to use the `firebase-database.js` module to save and retrieve data across platforms for the Elijah Project learning management system.

## Database Structure

### Firestore Collections

```
users/ (main user documents)
├── {uid}
│   ├── Basic fields: email, username, createdAt, isAdmin, settings
│   ├── modules: {} (module progress data)
│   └── Subcollections:
│       ├── quizzes/
│       │   └── module_{M}_week_{W}
│       ├── quizDrafts/
│       │   └── module_{M}_week_{W}
│       ├── notes/
│       │   └── module_{M}_week_{W}
│       ├── bookmarks/
│       │   └── {bookmarkId}
│       ├── certificates/
│       │   └── module_{M}
│       └── studySessions/
│           └── session_{timestamp}
```

## Key Features

### 1. **User Profiles**
Store and manage user information with real-time synchronization.

```javascript
import { updateUserProfile, getUserProfile, listenToUserProfile } from './firebase-database.js';

// Update profile
await updateUserProfile({
  bio: "Student of Scripture",
  phone: "+1-555-1234",
  profilePicture: "url/to/image"
});

// Get profile
const profile = await getUserProfile();
console.log(profile.username);

// Listen for real-time changes
const unsubscribe = listenToUserProfile((profile) => {
  console.log("Profile updated:", profile);
});
```

### 2. **Module Progress Tracking**
Track which lessons users are on and their completion status.

```javascript
import { saveModuleProgress, getModuleProgress, completeModule } from './firebase-database.js';

// Save progress as user moves through lessons
await saveModuleProgress(2, {
  currentLesson: 3,
  currentWeek: 1,
  timeSpent: 45, // minutes
  progress: 0.6 // 60% complete
});

// Get progress
const progress = await getModuleProgress(2);
console.log(progress.currentLesson); // 3

// Mark module as complete
await completeModule(2);
```

### 3. **Quiz Management**
Save quiz responses, scores, and drafts for in-progress quizzes.

```javascript
import { saveQuizResponse, getQuizResponse, saveQuizDraft } from './firebase-database.js';

// Save completed quiz with answers and score
await saveQuizResponse(2, 1, {
  answers: [
    { questionId: 1, selectedAnswer: "B" },
    { questionId: 2, selectedAnswer: "true" }
  ],
  score: 85,
  totalQuestions: 10,
  passingScore: 70,
  completed: true
});

// Save quiz draft (for incomplete quizzes)
await saveQuizDraft(2, 1, {
  answers: [
    { questionId: 1, selectedAnswer: "B" }
  ]
});

// Get quiz response
const response = await getQuizResponse(2, 1);
console.log(response.score); // 85
```

### 4. **Personal Notes**
Users can save notes for each lesson across all devices.

```javascript
import { saveNotes, getNotes, getAllNotes } from './firebase-database.js';

// Save notes
const noteContent = `
  # Genesis to the Cross - Week 1 Notes
  - Key point about creation
  - Important verse: Genesis 1:1
`;
await saveNotes(2, 1, noteContent);

// Get notes for specific lesson
const notes = await getNotes(2, 1);
console.log(notes);

// Get all notes
const allNotes = await getAllNotes();
```

### 5. **Bookmarks & Saved Content**
Users can bookmark important lessons, verses, or resources.

```javascript
import { addBookmark, getBookmarks, removeBookmark } from './firebase-database.js';

// Add bookmark
await addBookmark({
  id: "bookmark_genesis1",
  type: "lesson",
  moduleNumber: 2,
  weekNumber: 1,
  title: "Creation Account",
  url: "/page2.html#creation",
  notes: "Important foundational passage"
});

// Get all bookmarks
const bookmarks = await getBookmarks();

// Remove bookmark
await removeBookmark("bookmark_genesis1");
```

### 6. **User Settings & Preferences**
Store user preferences that sync across devices.

```javascript
import { saveUserSettings, getUserSettings } from './firebase-database.js';

// Save settings
await saveUserSettings({
  emailNotifications: true,
  darkMode: false,
  fontSize: "16px",
  language: "en",
  autoSave: true,
  showCompletionBadges: true
});

// Get settings
const settings = await getUserSettings();
console.log(settings.darkMode); // false
```

### 7. **Certificates & Achievements**
Award certificates when users complete modules.

```javascript
import { awardCertificate, getCertificates } from './firebase-database.js';

// Award certificate
await awardCertificate(2, {
  title: "Module 2: From Genesis to the Cross",
  certificateNumber: "EP-2026-002-12345",
  completedDate: new Date().toISOString(),
  instructorName: "Pastor Ronald Green"
});

// Get all certificates
const certificates = await getCertificates();
```

### 8. **Study Analytics**
Track study sessions and generate analytics.

```javascript
import { recordStudySession, getStudyAnalytics } from './firebase-database.js';

// Record study session
await recordStudySession({
  moduleNumber: 2,
  weekNumber: 1,
  durationMinutes: 45,
  topicsReviewed: ["Genesis", "Creation"],
  lessonsCompleted: 2
});

// Get analytics for last 30 days
const analytics = await getStudyAnalytics(30);
console.log(analytics);
// Output: {
//   totalMinutes: 1350,
//   totalSessions: 15,
//   averageSessionLength: 90,
//   lastSessionDate: "2026-04-15T..."
// }
```

### 9. **Data Synchronization**
Automatically sync local data when connection is restored.

```javascript
import { syncLocalDataToFirebase } from './firebase-database.js';

// Call this when user goes back online
window.addEventListener('online', async () => {
  await syncLocalDataToFirebase();
  console.log("Data synced!");
});
```

### 10. **Data Export (GDPR Compliance)**
Export all user data for download.

```javascript
import { exportUserData } from './firebase-database.js';

// Export all data
const data = await exportUserData();
const json = JSON.stringify(data, null, 2);
// Download or display to user
```

### 11. **Account Deletion**
Delete all user data when account is closed.

```javascript
import { deleteAllUserData } from './firebase-database.js';

// Delete everything
await deleteAllUserData();
```

## Offline Support

The database module includes automatic offline support:
- All operations save to **localStorage** when user is offline
- Data automatically syncs to Firebase when connection is restored
- Users can continue learning without interruption

```javascript
// Example: This works offline
if (navigator.onLine) {
  await saveModuleProgress(2, progressData); // Firebase
} else {
  localStorage.setItem(`module_2_progress`, JSON.stringify(progressData)); // Local
}
```

## Data Schema Examples

### User Document
```json
{
  "uid": "user123",
  "email": "student@example.com",
  "username": "John Doe",
  "createdAt": "2026-01-15T10:30:00Z",
  "isAdmin": false,
  "settings": {
    "emailNotifications": true,
    "darkMode": false,
    "language": "en",
    "updatedAt": "2026-04-15T14:20:00Z"
  },
  "modules": {
    "1": {
      "completed": true,
      "completedDate": "2026-02-20T15:45:00Z",
      "currentLesson": 5,
      "progress": 1.0
    },
    "2": {
      "completed": false,
      "currentLesson": 3,
      "currentWeek": 1,
      "timeSpent": 120,
      "progress": 0.6,
      "lastUpdated": "2026-04-15T12:00:00Z"
    }
  }
}
```

### Quiz Response
```json
{
  "moduleNumber": 2,
  "weekNumber": 1,
  "answers": [
    { "questionId": 1, "selectedAnswer": "B" },
    { "questionId": 2, "selectedAnswer": "true" }
  ],
  "score": 85,
  "totalQuestions": 10,
  "passingScore": 70,
  "completed": true,
  "submittedAt": "2026-04-15T14:30:00Z"
}
```

### Certificate
```json
{
  "moduleNumber": 2,
  "title": "Module 2: From Genesis to the Cross",
  "certificateNumber": "EP-2026-002-12345",
  "completedDate": "2026-04-15T00:00:00Z",
  "instructorName": "Pastor Ronald Green",
  "awardedAt": "2026-04-15T14:35:00Z"
}
```

## Integration Example

```javascript
import { 
  saveModuleProgress, 
  completeModule, 
  saveQuizResponse,
  saveNotes,
  awardCertificate 
} from './firebase-database.js';

// When user progresses through lesson
async function handleLessonProgress(moduleNum, weekNum, lessonNum) {
  await saveModuleProgress(moduleNum, {
    currentWeek: weekNum,
    currentLesson: lessonNum,
    progress: (lessonNum / 4) // Assuming 4 lessons per week
  });
}

// When user completes quiz
async function handleQuizSubmit(moduleNum, weekNum, answers, score) {
  await saveQuizResponse(moduleNum, weekNum, {
    answers,
    score,
    completed: true
  });
  
  // Award certificate if module is now complete
  if (score >= 70) {
    await completeModule(moduleNum);
    await awardCertificate(moduleNum, {
      title: `Module ${moduleNum} Complete`,
      certificateNumber: `EP-2026-${moduleNum}-${Date.now()}`,
      completedDate: new Date().toISOString()
    });
  }
}

// When user saves notes
async function handleNoteSave(moduleNum, weekNum, content) {
  await saveNotes(moduleNum, weekNum, content);
}
```

## Firestore Rules (Security)

Add these rules to your Firestore to ensure data security:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Subcollections follow same rule
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Public data (if needed)
    match /courses/{document=**} {
      allow read: if true;
      allow write: if false; // Only admin
    }
  }
}
```

## Best Practices

1. **Error Handling**: Always wrap Firebase calls in try-catch
2. **Offline First**: Design UI assuming users might be offline
3. **Real-time Updates**: Use listeners for frequently accessed data
4. **Batch Operations**: Use `syncLocalDataToFirebase()` for bulk syncing
5. **Privacy**: Never expose sensitive data in console
6. **Testing**: Test offline functionality thoroughly

## Performance Tips

- Use `serverTimestamp()` instead of `new Date()` for consistency
- Cache frequently accessed data in localStorage
- Use `merge: true` to avoid overwriting data
- Query only needed fields with `.select()`
- Paginate large datasets

## Troubleshooting

**Quiz data not saving:**
- Check if user is authenticated
- Verify Firestore rules allow write access
- Check browser console for errors

**Data not syncing:**
- Ensure network connection
- Call `syncLocalDataToFirebase()` manually
- Check localStorage for cached data

**Performance issues:**
- Reduce number of real-time listeners
- Use pagination for large lists
- Consider caching strategies
