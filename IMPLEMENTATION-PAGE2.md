# Firebase Database Integration Guide - Page2.html

## What Was Integrated

The `page2.html` file has been updated with Firebase database functionality. Here's what's now working:

### ✅ Features Implemented

1. **Auto-Save Essays**
   - Essays are automatically saved to Firebase 2 seconds after user stops typing
   - Works offline - saves to localStorage first, syncs to Firebase when online
   - User sees no interruption while typing

2. **Quiz Responses Saved**
   - When user submits a quiz, answers and scores are saved to Firebase
   - Quiz data includes: answers, score, total questions, passed/failed status
   - Three quizzes on the page (Lesson 1, 2, 3) all save data

3. **Module Progress Tracking**
   - When page loads, module progress is updated in Firebase
   - Records which lesson user is on and completion percentage
   - Tracks time spent on module

4. **Study Session Recording**
   - When user completes module and continues, session duration is recorded
   - Helps track total study time across all modules

5. **Load Previous Work**
   - When user returns to page, previously saved essays auto-load
   - Quiz completion status shows as completed instead of repeating quiz

## How It Works (Technical Details)

### Import Section (Added)
```javascript
import { 
    saveNotes,                // Saves/loads essay text
    getNotes,                 // Retrieves saved essays
    saveQuizResponse,         // Saves quiz answers & scores
    saveModuleProgress,       // Records progress
    completeModule,           // Marks module complete
    recordStudySession        // Records session time
} from './firebase-database.js';
```

### Essay Auto-Save (New)
```javascript
// Debounced auto-save on textarea input
textarea.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveNotes(MODULE_NUMBER, essayNumber, textarea.value);
    }, 2000); // Saves 2 seconds after typing stops
});
```

### Quiz Submission (Updated)
```javascript
// When quiz submitted, collect answers and save
const answers = [];
for (let i = 1; i <= totalQuestions; i++) {
    const answer = document.querySelector(`input[name="q${i}"]:checked`)?.value;
    answers.push({
        questionId: i,
        selectedAnswer: answer,
        correctAnswer: correctAnswers[`q${i}`]
    });
}
window.saveQuizResponseToFirebase(2, 1, answers, score, totalQuestions);
```

## Applying This to Other Pages (page3-page19)

### Step 1: Add Module Import
At the top of your module script, add:
```javascript
import { 
    saveNotes, 
    getNotes, 
    saveQuizResponse, 
    saveModuleProgress, 
    completeModule,
    recordStudySession 
} from './firebase-database.js';

const MODULE_NUMBER = 3; // Change to your module number
let sessionStartTime = Date.now();
```

### Step 2: Setup Auto-Save for Essays/Notes
```javascript
function setupAutoSaveEssays() {
    const essayFields = ['essayId1', 'essayId2', 'essayId3']; // Change to your IDs
    let saveTimeout;
    
    essayFields.forEach(fieldId => {
        const textarea = document.getElementById(fieldId);
        if (textarea) {
            textarea.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    const weekNum = fieldId.replace('essay', '');
                    saveNotes(MODULE_NUMBER, weekNum, textarea.value);
                }, 2000);
            });
        }
    });
}
```

### Step 3: Load Saved Essays on Page Load
```javascript
async function loadSavedEssays() {
    const essayFields = [
        { id: 'essayId1', week: 1 },
        { id: 'essayId2', week: 2 }
    ];
    
    for (const field of essayFields) {
        const textarea = document.getElementById(field.id);
        if (textarea) {
            const notes = await getNotes(MODULE_NUMBER, field.week);
            if (notes) textarea.value = notes;
        }
    }
}

document.addEventListener('DOMContentLoaded', loadSavedEssays);
```

### Step 4: Save Quiz Responses
In each quiz submit function, add:
```javascript
const answers = [];
for (let i = 1; i <= totalQuestions; i++) {
    const answer = document.querySelector(`input[name="questionName${i}"]:checked`)?.value;
    answers.push({
        questionId: i,
        selectedAnswer: answer || '',
        correctAnswer: correctAnswers[`q${i}`]
    });
}

if (window.saveQuizResponseToFirebase) {
    window.saveQuizResponseToFirebase(MODULE_NUMBER, weekNumber, answers, score, totalQuestions);
}
```

### Step 5: Track Module Completion
```javascript
async function handleModuleComplete(event) {
    event.preventDefault();
    const target = event.currentTarget.href;
    
    await Promise.all([
        saveAllEssays(),
        completeModule(MODULE_NUMBER),
        recordStudySession({
            moduleNumber: MODULE_NUMBER,
            durationMinutes: Math.round((Date.now() - sessionStartTime) / 60000)
        })
    ]);
    
    window.location.href = target;
}
```

## Testing the Integration

### 1. Test Auto-Save
- Open a page with essays
- Type in an essay field and wait 2 seconds
- Check Firebase Console → Firestore → users/{uid}/notes
- You should see your essay saved

### 2. Test Quiz Submission
- Take a quiz and submit
- Check Firebase Console → Firestore → users/{uid}/quizzes
- You should see quiz response with score and answers

### 3. Test Persistence
- Reload the page
- Essays should appear again with your saved text
- Quizzes should show as completed

### 4. Test Offline
- Open DevTools → Network → Go Offline
- Save an essay
- Check localStorage - should have `module_X_week_Y` key
- Go back online
- Essay should sync to Firebase

## Debugging

### Check if Data is Saving
```javascript
// In browser console
const uid = await (await import('./auth.js')).getCurrentUser().uid;
console.log(uid);

// Then check Firebase Console
// Navigate to: Firestore → users → [UID] → notes or quizzes
```

### Enable Debug Logging
```javascript
// Add to firebase-database.js
import { enableLogging } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
enableLogging(true);
```

### Check LocalStorage
```javascript
// In browser console
localStorage.getItem('module_2_week_1'); // Returns saved essay
localStorage.getItem('quiz_2_1_completed'); // Returns 'true' if completed
```

## Common Issues & Solutions

### Issue: Essays not saving
**Solution:** 
- Check if user is logged in
- Check browser console for errors
- Verify essays have at least 1 character
- Wait 2+ seconds after typing

### Issue: Quiz responses not showing in Firebase
**Solution:**
- Verify quiz submit button calls saveQuizResponseToFirebase
- Check Firebase rules allow write access
- Verify quiz form has proper input names

### Issue: Data not loading on page refresh
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Check if Firebase rules deny read access
- Verify localStorage has data as fallback

## Data Structure Reference

### Saved Essays (Notes)
```javascript
// Firebase: users/{uid}/notes/module_{M}_week_{W}
{
  moduleNumber: 2,
  weekNumber: 1,
  content: "Your essay text here...",
  updatedAt: Timestamp,
  userId: "user123"
}
```

### Quiz Response
```javascript
// Firebase: users/{uid}/quizzes/module_{M}_week_{W}
{
  moduleNumber: 2,
  weekNumber: 1,
  answers: [
    { questionId: 1, selectedAnswer: "A", correctAnswer: "A" },
    { questionId: 2, selectedAnswer: "B", correctAnswer: "B" }
  ],
  score: 85,
  totalQuestions: 2,
  passingScore: 70,
  passed: true,
  completed: true,
  submittedAt: Timestamp,
  userId: "user123"
}
```

## Next Steps

1. **Apply to Other Modules**: Use the steps above to add auto-save to pages 3-19
2. **Add Bookmarks**: Implement bookmark functionality for important lessons
3. **Dashboard**: Show progress on dashboard.html using module progress data
4. **Certificates**: Award certificates when modules are completed
5. **Analytics**: Display study time on user profile

See `FIREBASE-DATABASE-GUIDE.md` for full API documentation.
