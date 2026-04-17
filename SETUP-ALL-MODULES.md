# Applying Firebase Database to All Modules (Pages 1-19)

## Quick Start

### For Each Module Page, Follow These 3 Steps:

**Step 1: Add Configuration**
Update `module-configs.js` with your module's essay field IDs and quiz info

**Step 2: Add the Integration Script**
Copy the script from `APPLY-FIREBASE-TO-ALL-PAGES.js` into your page

**Step 3: Update Quiz Handlers**
Add Firebase save calls to all quiz submit functions

---

## Step-by-Step Guide for Each Module

### Module 1 (page1.html) through Module 19 (page19.html)

#### Step 1: Update module-configs.js

Find the module you're working on and update the `essayFields` array to match your HTML IDs:

```javascript
// Example for Module 3 (page3.html)
3: {
    moduleNumber: 3,
    title: "Module 3: Identity in Christ",
    essayFields: [
        { id: 'essayId1', week: 1 },      // ← Match your HTML textarea IDs
        { id: 'essayId2', week: 2 },
        { id: 'essayId3', week: 3 }
    ],
    totalLessons: 4,
    quizzes: {
        1: { totalQuestions: 6 },
        2: { totalQuestions: 5 },
        3: { totalQuestions: 7 }
    }
}
```

**Find your essay textarea IDs in the HTML:**
```html
<textarea id="essayId1" ...></textarea>
<!-- Your ID will be: essayId1 -->
```

#### Step 2: Add Integration Script to Your Module Page

At the bottom of your HTML file (before `</body>`), add:

```html
<script type="module">
    import { 
        saveNotes, 
        getNotes, 
        saveQuizResponse, 
        saveModuleProgress, 
        completeModule,
        recordStudySession 
    } from './firebase-database.js';
    
    import { markModuleComplete } from './auth.js';
    import { getModuleConfig } from './module-configs.js';

    const MODULE_NUMBER = 3; // ← CHANGE TO YOUR MODULE NUMBER

    const config = getModuleConfig(MODULE_NUMBER);
    const essayFields = config.essayFields || [];
    let sessionStartTime = Date.now();

    // Auto-save essays
    function setupAutoSaveEssays() {
        let saveTimeout;
        essayFields.forEach(field => {
            const textarea = document.getElementById(field.id);
            if (textarea) {
                textarea.addEventListener('input', () => {
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        saveNotes(MODULE_NUMBER, field.week, textarea.value)
                            .catch(err => console.error('Auto-save error:', err));
                    }, 2000);
                });
            }
        });
    }

    // Load saved essays
    async function loadSavedEssays() {
        for (const field of essayFields) {
            const textarea = document.getElementById(field.id);
            if (textarea) {
                try {
                    const notes = await getNotes(MODULE_NUMBER, field.week);
                    if (notes) textarea.value = notes;
                } catch (error) {
                    console.error('Error loading essay:', error);
                }
            }
        }
    }

    // Save all essays
    async function saveAllEssays() {
        const essays = {};
        essayFields.forEach(field => {
            essays[field.week] = document.getElementById(field.id)?.value || '';
        });

        for (const [week, content] of Object.entries(essays)) {
            if (content) {
                try {
                    await saveNotes(MODULE_NUMBER, week, content);
                } catch (error) {
                    console.error(`Error saving essay week ${week}:`, error);
                }
            }
        }
    }

    // Quiz response handler
    window.saveQuizResponseToFirebase = async (weekNumber, answers, score, totalQuestions) => {
        try {
            await saveQuizResponse(MODULE_NUMBER, weekNumber, {
                answers: answers,
                score: score,
                totalQuestions: totalQuestions,
                passingScore: 70,
                passed: score >= 70,
                completed: true
            });
        } catch (error) {
            console.error('Error saving quiz:', error);
        }
    };

    // Handle module completion
    window.handleModuleComplete = function(event) {
        event.preventDefault();
        const target = event.currentTarget.href;

        const btnText = document.getElementById('btnText');
        const btnLoading = document.getElementById('btnLoading');
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';

        const durationMinutes = Math.round((Date.now() - sessionStartTime) / 60000);

        Promise.all([
            saveAllEssays(),
            completeModule(MODULE_NUMBER),
            recordStudySession({
                moduleNumber: MODULE_NUMBER,
                durationMinutes: durationMinutes,
                completedAt: new Date().toISOString()
            })
        ]).then(() => {
            setTimeout(() => window.location.href = target, 500);
        }).catch(err => {
            console.error('Error:', err);
            setTimeout(() => window.location.href = target, 500);
        });
    };

    // Update progress
    async function updateModuleProgress() {
        try {
            await saveModuleProgress(MODULE_NUMBER, {
                currentLesson: 1,
                currentWeek: 1,
                progress: 0.25,
                lastAccessedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            setupAutoSaveEssays();
            await loadSavedEssays();
            await updateModuleProgress();
        });
    } else {
        setupAutoSaveEssays();
        loadSavedEssays();
        updateModuleProgress();
    }
</script>
```

#### Step 3: Update Quiz Submit Functions

For each quiz on your page, update the submit function:

```javascript
// BEFORE (old code):
function submitQuiz() {
    let score = 0;
    // ... calculate score ...
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.add('show');
}

// AFTER (with Firebase):
function submitQuiz() {
    let score = 0;
    const totalQuestions = 6;
    const correctAnswers = { q1: 'c', q2: 'true', q3: 'd', ... };
    
    // Collect answers
    const answers = [];
    for (let i = 1; i <= totalQuestions; i++) {
        const answer = document.querySelector(`input[name="q${i}"]:checked`)?.value;
        answers.push({
            questionId: i,
            selectedAnswer: answer || '',
            correctAnswer: correctAnswers[`q${i}`]
        });
        if (answer === correctAnswers[`q${i}`]) score++;
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Show results
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.add('show');
    
    // SAVE TO FIREBASE (NEW)
    if (window.saveQuizResponseToFirebase) {
        window.saveQuizResponseToFirebase(1, answers, percentage, totalQuestions);
    }
}
```

---

## Module-by-Module Checklist

### Module 1 (page1.html)
- [ ] Check essay textarea IDs in HTML
- [ ] Update module-configs.js essay field IDs
- [ ] Add integration script
- [ ] Update quiz submit functions
- [ ] Test auto-save by typing in essay
- [ ] Test quiz submission

### Module 2 (page2.html) ✓ ALREADY DONE
Already configured with ids: m2essay1, m2essay2, m2essay3

### Module 3 (page3.html)
- [ ] Check essay textarea IDs in HTML
- [ ] Update module-configs.js essay field IDs
- [ ] Add integration script
- [ ] Update quiz submit functions
- [ ] Test

### Module 4-19 (page4.html - page19.html)
Repeat the same steps for each module

---

## Testing Each Module

### Quick Test Checklist

1. **Auto-Save Test**
   - Open module page
   - Type in essay textarea
   - Wait 2 seconds
   - Refresh page
   - Essay should reappear ✓

2. **Quiz Test**
   - Take quiz and submit
   - Check browser console for success message
   - Sign in and check Firebase Console
   - Navigate to Firestore → users → [your UID] → quizzes
   - Quiz data should appear ✓

3. **Complete Module Test**
   - Click "Complete and Continue" button
   - Should see "Saving..." message
   - Should redirect to next page
   - Check Firebase for completed status ✓

---

## Common Issues & Fixes

### Issue: Essays not auto-saving
**Check:**
1. Are textarea IDs correct in module-configs.js?
2. Is the script loading (check console)?
3. Wait 2+ seconds after typing
4. Are you logged in?

**Fix:**
```javascript
// Open browser console and run:
localStorage.getItem('module_3_week_1')
// Should show your essay text
```

### Issue: Quiz not saving to Firebase
**Check:**
1. Did you add `window.saveQuizResponseToFirebase` calls?
2. Is user logged in?
3. Check browser console for errors

**Fix:**
```javascript
// Add to quiz submit function:
console.log('Saving quiz...', answers, score);
window.saveQuizResponseToFirebase(weekNumber, answers, score, totalQuestions);
```

### Issue: "Cannot find module" error
**Check:**
1. All files exist in workspace:
   - firebase-database.js ✓
   - module-configs.js ✓
   - auth.js ✓
2. Import paths are correct

**Fix:**
Use relative paths:
```javascript
import { saveNotes } from './firebase-database.js'; // Correct
import { saveNotes } from 'firebase-database.js';   // Wrong
```

---

## Files Needed for All Modules

Make sure these files exist in your project:

```
✓ firebase-database.js          - Core database module
✓ module-configs.js              - Configuration for all modules
✓ auth.js                        - Authentication module
✓ APPLY-FIREBASE-TO-ALL-PAGES.js - Copy-paste template
✓ IMPLEMENTATION-PAGE2.md        - Reference for page2 setup
✓ page1.html through page19.html - Your module pages
```

---

## Bulk Update for All Pages

If you want to update multiple pages at once:

1. **Update module-configs.js first** with all essay field IDs
2. **Add the integration script** to each page
3. **Update quiz handlers** in each page

Use Find & Replace in VS Code:
- Find: `const MODULE_NUMBER = 2;`
- Replace: Change to correct number for each page

---

## Progress Tracking

Mark progress here:

```
Module 1:  [ ] Not Started
Module 2:  [✓] Complete
Module 3:  [ ] Not Started
Module 4:  [ ] Not Started
Module 5:  [ ] Not Started
Module 6:  [ ] Not Started
Module 7:  [ ] Not Started
Module 8:  [ ] Not Started
Module 9:  [ ] Not Started
Module 10: [ ] Not Started
Module 11: [ ] Not Started
Module 12: [ ] Not Started
Module 13: [ ] Not Started
Module 14: [ ] Not Started
Module 15: [ ] Not Started
Module 16: [ ] Not Started
Module 17: [ ] Not Started
Module 18: [ ] Not Started
Module 19: [ ] Not Started
```

---

## Next Steps

1. Update essay field IDs in module-configs.js for all modules
2. Add integration script to each page
3. Update quiz handlers for each page
4. Test each module
5. Monitor Firebase for data sync

See `FIREBASE-DATABASE-GUIDE.md` for complete API documentation.
