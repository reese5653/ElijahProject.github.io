# Firebase Integration Quick Reference Card

## The Three Simple Steps

### 1️⃣ UPDATE CONFIG
```javascript
// File: module-configs.js
// Change this entry for your module:

YOUR_MODULE_NUMBER: {
    moduleNumber: YOUR_NUMBER,
    title: "Your Module Title",
    essayFields: [
        { id: 'essayId1', week: 1 },      // ← From your HTML
        { id: 'essayId2', week: 2 },
        { id: 'essayId3', week: 3 }
    ],
    totalLessons: 4,
    quizzes: {
        1: { totalQuestions: 6 },         // ← Count from HTML
        2: { totalQuestions: 5 },
        3: { totalQuestions: 7 }
    }
}
```

### 2️⃣ ADD SCRIPT
Paste this before `</body>` in your module page (change MODULE_NUMBER):
```html
<script type="module">
    import { 
        saveNotes, getNotes, saveQuizResponse, 
        saveModuleProgress, completeModule, recordStudySession 
    } from './firebase-database.js';
    import { markModuleComplete } from './auth.js';
    import { getModuleConfig } from './module-configs.js';

    const MODULE_NUMBER = 3; // ← CHANGE THIS

    const config = getModuleConfig(MODULE_NUMBER);
    const essayFields = config.essayFields || [];
    let sessionStartTime = Date.now();

    function setupAutoSaveEssays() {
        let saveTimeout;
        essayFields.forEach(field => {
            const textarea = document.getElementById(field.id);
            if (textarea) {
                textarea.addEventListener('input', () => {
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        saveNotes(MODULE_NUMBER, field.week, textarea.value);
                    }, 2000);
                });
            }
        });
    }

    async function loadSavedEssays() {
        for (const field of essayFields) {
            const textarea = document.getElementById(field.id);
            if (textarea) {
                const notes = await getNotes(MODULE_NUMBER, field.week);
                if (notes) textarea.value = notes;
            }
        }
    }

    async function saveAllEssays() {
        for (const field of essayFields) {
            const content = document.getElementById(field.id)?.value;
            if (content) await saveNotes(MODULE_NUMBER, field.week, content);
        }
    }

    window.saveQuizResponseToFirebase = async (weekNumber, answers, score, total) => {
        await saveQuizResponse(MODULE_NUMBER, weekNumber, {
            answers, score, totalQuestions: total, 
            passed: score >= 70, completed: true
        });
    };

    window.handleModuleComplete = function(event) {
        event.preventDefault();
        const target = event.currentTarget.href;
        const durationMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
        
        Promise.all([
            saveAllEssays(),
            completeModule(MODULE_NUMBER),
            recordStudySession({ moduleNumber: MODULE_NUMBER, durationMinutes, completedAt: new Date().toISOString() })
        ]).then(() => {
            setTimeout(() => window.location.href = target, 500);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupAutoSaveEssays();
            loadSavedEssays();
        });
    } else {
        setupAutoSaveEssays();
        loadSavedEssays();
    }
</script>
```

### 3️⃣ UPDATE QUIZ HANDLERS
```javascript
// In each submitQuiz() function:

// ADD THIS CODE:
let score = 0;
const totalQuestions = 6;  // Count your questions
const correctAnswers = { q1: 'a', q2: 'b', q3: 'true', ... };

const answers = [];
for (let i = 1; i <= totalQuestions; i++) {
    const selected = document.querySelector(`input[name="q${i}"]:checked`)?.value;
    if (selected === correctAnswers[`q${i}`]) score++;
    answers.push({
        questionId: i,
        selectedAnswer: selected || '',
        correctAnswer: correctAnswers[`q${i}`]
    });
}

const percentage = Math.round((score / totalQuestions) * 100);

// SAVE TO FIREBASE:
window.saveQuizResponseToFirebase(1, answers, percentage, totalQuestions);

// THEN YOUR EXISTING CODE...
```

---

## Finding Data from Your HTML

### Find Essay Field IDs
```html
<!-- Look for: -->
<textarea id="essayId1"></textarea>
<!-- Copy: essayId1 -->
```

### Count Quiz Questions
```html
<!-- Look for: -->
<input type="radio" name="q1" value="...">  q1
<input type="radio" name="q2" value="...">  q2
<input type="radio" name="q3" value="...">  q3
<!-- ... count all questions ... -->
<!-- Total: 6 questions -->
```

### Find Quiz Week Number
```html
<!-- Look for: -->
<h3>Week 1 Quiz</h3>    <!-- week: 1 -->
<h3>Week 2 Quiz</h3>    <!-- week: 2 -->
```

---

## Testing Quick Checklist

```
[ ] Add config to module-configs.js
[ ] Add script to module page
[ ] Change MODULE_NUMBER to correct module
[ ] Verify essay field IDs exist in HTML
[ ] Type in essay - should see auto-save
[ ] Refresh page - essay should still be there
[ ] Submit quiz - check browser console for errors
[ ] Sign in to Firebase Console
[ ] Navigate to: Firestore → users → [yourUID] → notes → [module] → [week]
[ ] See your essay saved
[ ] Check quizzes collection for quiz responses
[ ] All working? ✅ Move to next module
```

---

## Troubleshooting One-Liners

| Problem | Solution |
|---------|----------|
| Essays not saving | Check localStorage: `localStorage.getItem('module_3_week_1')` |
| Module number wrong | Change `const MODULE_NUMBER = 3` to your number |
| Essay IDs don't match | Verify `essayFields` IDs in configs match HTML textarea ids |
| Quiz not saving | Add `window.saveQuizResponseToFirebase()` call in submitQuiz() |
| Import errors | Use `./firebase-database.js` not `firebase-database.js` (need ./) |
| Not logged in | Check auth.js is working, user signed in |
| Firebase data not appearing | Check user UID in Firebase Console |

---

## Copy-Paste Configs for Common Patterns

### Pattern 1: Generic IDs
```javascript
essayFields: [
    { id: 'essay1', week: 1 },
    { id: 'essay2', week: 2 },
    { id: 'essay3', week: 3 }
]
```

### Pattern 2: Module-Prefixed
```javascript
essayFields: [
    { id: 'm5essay1', week: 1 },
    { id: 'm5essay2', week: 2 },
    { id: 'm5essay3', week: 3 }
]
```

### Pattern 3: Named
```javascript
essayFields: [
    { id: 'reflectionEssay', week: 1 },
    { id: 'analysisEssay', week: 2 },
    { id: 'conclusionEssay', week: 3 }
]
```

### Pattern 4: Quiz Counts (update for your module)
```javascript
quizzes: {
    1: { totalQuestions: 6 },
    2: { totalQuestions: 5 },
    3: { totalQuestions: 7 }
}
```

---

## Module Number → File Mapping

```
1  → page1.html
2  → page2.html   ✅ DONE
3  → page3.html
4  → page4.html
5  → page5.html
6  → page6.html
7  → page7.html
8  → page8.html
9  → page9.html
10 → page10.html
11 → page11.html
12 → page12.html
13 → page13.html
14 → page14.html
15 → page15.html
16 → page16.html
17 → page17.html
18 → page18.html
19 → page19.html
```

---

## Required Files Check

Before you start, verify these files exist:

```bash
✅ firebase-database.js        - Core module
✅ module-configs.js            - Configuration
✅ auth.js                      - Authentication
✅ pageX.html                   - Your module page (where you're adding)
```

If any missing, contact me.

---

## Firebase Console Navigation

After saving, check data here:

1. Go to: https://console.firebase.google.com
2. Select project: **elijah-project-9c433**
3. Click: **Firestore Database**
4. Navigate: **users** → **[your-uid]** → **notes** → **[module]** → **[week]**
5. You should see your essay text

---

## Time Estimates per Module

```
Update config:        5-10 min
Add script:           2-3 min
Update quiz handlers: 5-10 min
Test everything:      5-10 min
─────────────────────────────
Total per module:     15-30 min
```

For 18 modules: 4.5 to 9 hours total

---

## Success Indicators

✅ **System is working when:**

- Type essay → Wait 2 sec → Check localStorage (should see text)
- Refresh page → Essay reappears
- Submit quiz → No console errors → Check Firebase → Data saved
- New device/browser → Sign in → See same data
- Go offline → Save essay → Go online → Data syncs

---

## When You Get Stuck

1. **Check console:** Open DevTools (F12) → Console tab
2. **Check localStorage:** Run `localStorage.getItem('module_3_week_1')`
3. **Check Firebase:** Go to Firebase Console and look for data
4. **Check configs:** Verify essay IDs match HTML
5. **Check script:** Verify MODULE_NUMBER is correct
6. **Check auth:** Verify user is logged in

---

## Files to Refer To

- **SETUP-ALL-MODULES.md** - Full step-by-step guide
- **HOW-TO-UPDATE-CONFIGS.md** - Config update details
- **FIREBASE-DATABASE-GUIDE.md** - Complete API reference
- **IMPLEMENTATION-PAGE2.md** - Working example (page 2)
- **APPLY-FIREBASE-TO-ALL-PAGES.js** - Full template script

---

## One More Thing

After each module is done:
```javascript
// Test script - run in browser console:
import { getModuleConfig } from './module-configs.js';
console.log(getModuleConfig(5));  // Replace 5 with your module number
// Should show your config without errors
```

---

**READY TO START?**

Pick a module number (3 is good) and begin with Step 1!

Good luck! 🚀
