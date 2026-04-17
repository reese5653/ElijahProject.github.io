# Firebase Database Schema & Setup Guide

## Quick Start

1. The database is already configured in `auth.js` using the Firebase project: `elijah-project-9c433`
2. Import functions from `firebase-database.js` in your pages
3. Data automatically syncs across all user devices

## Complete Data Schema

### 1. Users Collection

**Path:** `/users/{uid}`

```typescript
{
  // Authentication
  uid: string                    // Auto-set from Firebase Auth
  email: string
  
  // Profile Information
  username: string
  bio?: string
  profilePicture?: string
  phone?: string
  
  // Account Status
  createdAt: Timestamp          // Auto set on signup
  updatedAt: Timestamp
  lastLoginAt: Timestamp
  isAdmin: boolean              // Default: false
  
  // Learning Settings
  settings: {
    emailNotifications: boolean
    darkMode: boolean
    fontSize: string
    language: string
    autoSave: boolean
    showCompletionBadges: boolean
    updatedAt: Timestamp
  }
  
  // Aggregated Module Data
  modules: {
    [moduleNumber]: {
      moduleNumber: number      // 1-19
      completed: boolean
      completedDate?: Timestamp
      currentWeek: number       // 1-4
      currentLesson: number     // Lesson within week
      progress: number          // 0-1 (percentage)
      timeSpent: number         // Minutes
      lastUpdated: Timestamp
    }
  }
}
```

### 2. User Quizzes Subcollection

**Path:** `/users/{uid}/quizzes/module_{M}_week_{W}`

```typescript
{
  moduleNumber: number
  weekNumber: number
  
  // Quiz Responses
  answers: [
    {
      questionId: number
      selectedAnswer: string    // 'A', 'B', 'true', etc.
      correctAnswer: string
      timeSpent?: number        // Seconds
    }
  ]
  
  // Scoring
  score: number                 // 0-100
  totalQuestions: number
  passingScore: number
  passed: boolean
  
  // Metadata
  attemptNumber: number
  completed: boolean
  submittedAt: Timestamp
  userId: string
}
```

### 3. Quiz Drafts Subcollection

**Path:** `/users/{uid}/quizDrafts/module_{M}_week_{W}`

```typescript
{
  moduleNumber: number
  weekNumber: number
  
  // In-Progress Answers
  answers: [
    {
      questionId: number
      selectedAnswer?: string   // Can be undefined if not answered
    }
  ]
  
  // Auto-save Info
  savedAt: Timestamp
  userId: string
  currentQuestionIndex?: number
}
```

### 4. Notes Subcollection

**Path:** `/users/{uid}/notes/module_{M}_week_{W}`

```typescript
{
  moduleNumber: number
  weekNumber: number
  
  // Note Content
  content: string              // Markdown or plain text
  
  // Metadata
  updatedAt: Timestamp
  createdAt: Timestamp
  userId: string
  
  // Optional
  lastModifiedDevice?: string  // 'web', 'mobile', 'desktop'
  tags?: string[]              // User-defined tags
}
```

### 5. Bookmarks Subcollection

**Path:** `/users/{uid}/bookmarks/{bookmarkId}`

```typescript
{
  id: string
  userId: string
  
  // Bookmark Details
  type: string                 // 'lesson', 'verse', 'resource'
  title: string
  moduleNumber: number
  weekNumber: number
  
  // Content
  url: string
  quoteText?: string
  notes?: string
  
  // Metadata
  createdAt: Timestamp
  importance?: number          // 1-5 star rating
}
```

### 6. Certificates Subcollection

**Path:** `/users/{uid}/certificates/module_{M}`

```typescript
{
  moduleNumber: number
  
  // Certificate Info
  title: string                // "Module 2: From Genesis to the Cross"
  certificateNumber: string    // Unique identifier
  displayName: string          // "Certificate of Completion"
  instructorName: string
  
  // Dates
  completedDate: Timestamp
  awardedAt: Timestamp
  
  // Optional
  scoreAchieved?: number
  certificateUrl?: string      // URL to downloadable PDF
}
```

### 7. Study Sessions Subcollection

**Path:** `/users/{uid}/studySessions/session_{timestamp}`

```typescript
{
  userId: string
  
  // Session Details
  moduleNumber: number
  weekNumber: number
  
  // Time Tracking
  durationMinutes: number
  recordedAt: Timestamp
  
  // Activity
  topicsReviewed?: string[]
  lessonsCompleted: number
  quizzesTaken?: number
  
  // Device Info
  deviceType?: string          // 'web', 'mobile', 'tablet'
}
```

## Firestore Index Requirements

Create these indexes for optimal query performance:

### Index 1: Study Analytics
```
Collection: users/{uid}/studySessions
Fields: recordedAt (Descending)
Status: Automatic (created on first query)
```

### Index 2: Quiz History
```
Collection: users/{uid}/quizzes
Fields: submittedAt (Descending)
Status: Automatic
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User data - each user can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // All subcollections inherit this rule
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Admin collection (optional)
    match /admin/{document=**} {
      allow read, write: if false; // Only via Cloud Functions
    }
    
    // Public course metadata (optional)
    match /courses/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Data Size Estimates

For 1000 active users completing 10 modules:

```
Users Collection:              ~500 KB
Quizzes (10 quizzes/user):    ~15 MB
Notes (20 notes/user):        ~25 MB
Bookmarks (30/user):          ~3 MB
Certificates (10/user):       ~2 MB
Study Sessions (100/user):    ~10 MB
────────────────────────────────────
Total Estimated:              ~55 MB
Monthly Firestore Cost:       ~$0.06-0.12
```

## Data Retention Policy

Recommended settings for `firebase-database.js`:

```javascript
// Archive old data after 1 year
const ARCHIVE_OLDER_THAN_DAYS = 365;

// Delete data after 5 years
const DELETE_OLDER_THAN_DAYS = 1825;

// Keep at least 10 latest study sessions
const MIN_STUDY_SESSIONS = 10;
```

## Backup & Recovery

### Automatic Backups
- Firebase automatically backs up data daily
- Accessible via Firebase Console under "Import/Export"

### Manual Export
```javascript
import { exportUserData } from './firebase-database.js';

const backup = await exportUserData();
localStorage.setItem('user_backup', JSON.stringify(backup));
```

### Restore from Backup
```javascript
const backup = JSON.parse(localStorage.getItem('user_backup'));
// Manually restore each field using updateUserProfile() etc.
```

## Performance Optimization

### 1. Caching Strategy
```javascript
// Local cache to avoid repeated reads
const cache = new Map();

export async function getCachedModuleProgress(moduleNumber, maxAge = 5 * 60 * 1000) {
  const cached = cache.get(`module_${moduleNumber}`);
  if (cached && Date.now() - cached.time < maxAge) {
    return cached.data;
  }
  
  const data = await getModuleProgress(moduleNumber);
  cache.set(`module_${moduleNumber}`, { data, time: Date.now() });
  return data;
}
```

### 2. Batch Reads
```javascript
// Instead of individual reads
Promise.all([
  getModuleProgress(1),
  getModuleProgress(2),
  getModuleProgress(3)
]);
```

### 3. Query Optimization
```javascript
// Firestore best practices
- Always add WHERE clauses to filter data
- Use LIMIT to cap results
- Create indexes for sorted queries
- Avoid N+1 queries in loops
```

## Migration from LocalStorage

If users have data in localStorage:

```javascript
export async function migrateLocalDataToFirebase() {
  const user = getCurrentUser();
  if (!user) return;

  for (let i = 1; i <= 19; i++) {
    const localProgress = localStorage.getItem(`module_${i}_progress`);
    if (localProgress) {
      await saveModuleProgress(i, JSON.parse(localProgress));
      localStorage.removeItem(`module_${i}_progress`);
    }
  }
  
  console.log("✓ Migration complete");
}
```

## Monitoring & Debugging

### Enable Debug Logging
```javascript
import { enableLogging } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
enableLogging(true);
```

### Monitor Firestore Usage
1. Go to Firebase Console
2. Click on "Firestore Database"
3. Check "Usage" tab for:
   - Read/Write operations
   - Stored data
   - Network usage

### Common Issues & Solutions

**Issue: Data not syncing**
```javascript
// Check offline status
console.log(navigator.onLine); // Should be true

// Manually trigger sync
import { syncLocalDataToFirebase } from './firebase-database.js';
await syncLocalDataToFirebase();
```

**Issue: Quiz answers not saving**
```javascript
// Ensure quiz format matches schema
const correctAnswerFormat = {
  questionId: 1,
  selectedAnswer: "A",
  correctAnswer: "B"
};
```

**Issue: High latency on quiz submit**
```javascript
// Use batch writes for multiple updates
import { writeBatch } from "firebase/firestore";

const batch = writeBatch(db);
// Add multiple operations
await batch.commit();
```

## Admin Dashboard Queries

### Get All User Statistics
```sql
-- Get top performers
SELECT 
  username,
  modules.completed_count,
  AVG(study_sessions.duration_minutes) as avg_session_length
FROM users
LEFT JOIN modules ON users.uid = modules.uid
LEFT JOIN study_sessions ON users.uid = study_sessions.uid
ORDER BY modules.completed_count DESC
LIMIT 20
```

### Module Completion Rates
```javascript
async function getModuleCompletionStats(moduleNumber) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where(`modules.${moduleNumber}.completed`, "==", true));
  const snapshot = await getDocs(q);
  return snapshot.size;
}
```

## Cost Optimization Tips

1. **Use Offline First:** Minimize reads when data is cached
2. **Batch Operations:** Write multiple records in one operation
3. **Set Data TTL:** Delete old study sessions automatically
4. **Regional Selection:** Use closest region to users
5. **Archive Strategy:** Move old data to Cloud Storage

## Testing

### Unit Tests for Database Functions
```javascript
describe('Firebase Database', () => {
  test('saveModuleProgress saves to Firestore', async () => {
    const moduleNumber = 1;
    const progressData = { currentLesson: 2, progress: 0.5 };
    
    await saveModuleProgress(moduleNumber, progressData);
    
    const saved = await getModuleProgress(moduleNumber);
    expect(saved.currentLesson).toBe(2);
  });
});
```

## Compliance & Privacy

- **GDPR:** Implement `exportUserData()` and `deleteAllUserData()`
- **Data Retention:** Define how long to keep study sessions
- **User Consent:** Show privacy policy before collecting data
- **Encryption:** Firebase handles encryption at rest automatically

## Next Steps

1. Review and customize security rules in Firebase Console
2. Set up Firestore indexes if needed
3. Test offline functionality thoroughly
4. Monitor usage in Firebase Console
5. Implement data retention policies
6. Create backup schedule
7. Train team on database best practices
