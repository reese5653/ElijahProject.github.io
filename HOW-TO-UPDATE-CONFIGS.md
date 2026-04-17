# How to Update module-configs.js for Each Module

## Overview
`module-configs.js` contains configuration information for all 19 modules. You need to update it with your actual essay field IDs and quiz information.

---

## Current Structure (Skeleton)

```javascript
export function getModuleConfig(moduleNumber) {
    const configs = {
        1: {
            moduleNumber: 1,
            title: "Module 1: Foundations",
            essayFields: [
                { id: 'essay1', week: 1 },
                { id: 'essay2', week: 2 },
                { id: 'essay3', week: 3 }
            ],
            totalLessons: 4,
            quizzes: {
                1: { totalQuestions: 6 },
                2: { totalQuestions: 5 },
                3: { totalQuestions: 7 }
            }
        },
        2: {
            moduleNumber: 2,
            title: "Module 2: Identity in Christ",
            essayFields: [
                { id: 'm2essay1', week: 1 },
                { id: 'm2essay2', week: 2 },
                { id: 'm2essay3', week: 3 }
            ],
            totalLessons: 4,
            quizzes: {
                1: { totalQuestions: 6 },
                2: { totalQuestions: 5 },
                3: { totalQuestions: 6 }
            }
        },
        // ... modules 3-19
    };
    return configs[moduleNumber] || null;
}
```

---

## Step 1: Find Essay Field IDs in Your HTML

Open your module page HTML (e.g., page3.html) and search for `<textarea>` tags:

```html
<!-- Example from page3.html -->
<textarea id="essayId1" placeholder="..."></textarea>
<textarea id="essayId2" placeholder="..."></textarea>
<textarea id="essayId3" placeholder="..."></textarea>
```

**Copy these IDs exactly:**
- essayId1
- essayId2
- essayId3

---

## Step 2: Find Quiz Question Counts

In the same HTML file, find your quiz sections and count questions:

```html
<!-- Example Quiz Week 1 -->
<h3>Week 1 Quiz</h3>
<form id="quiz1">
    <div class="question">
        <input type="radio" name="q1" value="a"> Option A
        <input type="radio" name="q1" value="b"> Option B
    </div>
    <div class="question">
        <input type="radio" name="q2" value="a"> Option A
        <!-- ... repeat for q3, q4, q5, q6 -->
    </div>
</form>
```

**Count total questions:** q1, q2, q3, q4, q5, q6 = **6 questions**

Repeat for Week 2, Week 3, etc.

---

## Step 3: Update module-configs.js

Once you have the information, update the module entry:

```javascript
3: {
    moduleNumber: 3,
    title: "Module 3: ACTUAL TITLE FROM YOUR PAGE",
    essayFields: [
        { id: 'essayId1', week: 1 },  // ← YOUR ACTUAL IDs
        { id: 'essayId2', week: 2 },
        { id: 'essayId3', week: 3 }
    ],
    totalLessons: 4,  // Update if different
    quizzes: {
        1: { totalQuestions: 6 },  // From your HTML count
        2: { totalQuestions: 5 },
        3: { totalQuestions: 7 }   // Add if you have more weeks
    }
}
```

---

## Quick Reference Table

Use this table to organize information for all modules:

| Module | HTML File | Essay Field IDs | Q1 Count | Q2 Count | Q3 Count | Notes |
|--------|-----------|-----------------|----------|----------|----------|-------|
| 1 | page1.html | essay1, essay2, essay3 | 6 | 5 | 7 | Needs verification |
| 2 | page2.html | m2essay1, m2essay2, m2essay3 | 6 | 5 | 6 | ✓ Done |
| 3 | page3.html | ? | ? | ? | ? | [ ] To Do |
| 4 | page4.html | ? | ? | ? | ? | [ ] To Do |
| 5 | page5.html | ? | ? | ? | ? | [ ] To Do |
| 6 | page6.html | ? | ? | ? | ? | [ ] To Do |
| 7 | page7.html | ? | ? | ? | ? | [ ] To Do |
| 8 | page8.html | ? | ? | ? | ? | [ ] To Do |
| 9 | page9.html | ? | ? | ? | ? | [ ] To Do |
| 10 | page10.html | ? | ? | ? | ? | [ ] To Do |
| 11 | page11.html | ? | ? | ? | ? | [ ] To Do |
| 12 | page12.html | ? | ? | ? | ? | [ ] To Do |
| 13 | page13.html | ? | ? | ? | ? | [ ] To Do |
| 14 | page14.html | ? | ? | ? | ? | [ ] To Do |
| 15 | page15.html | ? | ? | ? | ? | [ ] To Do |
| 16 | page16.html | ? | ? | ? | ? | [ ] To Do |
| 17 | page17.html | ? | ? | ? | ? | [ ] To Do |
| 18 | page18.html | ? | ? | ? | ? | [ ] To Do |
| 19 | page19.html | ? | ? | ? | ? | [ ] To Do |

---

## Common Patterns

### Pattern 1: Generic Essay IDs
If your module uses: `essay1`, `essay2`, `essay3`
```javascript
essayFields: [
    { id: 'essay1', week: 1 },
    { id: 'essay2', week: 2 },
    { id: 'essay3', week: 3 }
]
```

### Pattern 2: Module-Prefixed IDs
If your module uses: `m3essay1`, `m3essay2`, `m3essay3`
```javascript
essayFields: [
    { id: 'm3essay1', week: 1 },
    { id: 'm3essay2', week: 2 },
    { id: 'm3essay3', week: 3 }
]
```

### Pattern 3: Lesson-Based IDs
If your module uses: `lesson1essay`, `lesson2essay`, `lesson3essay`
```javascript
essayFields: [
    { id: 'lesson1essay', week: 1 },
    { id: 'lesson2essay', week: 2 },
    { id: 'lesson3essay', week: 3 }
]
```

### Pattern 4: Named IDs
If your module uses: `reflectionEssay`, `analysisEssay`, `conclusionEssay`
```javascript
essayFields: [
    { id: 'reflectionEssay', week: 1 },
    { id: 'analysisEssay', week: 2 },
    { id: 'conclusionEssay', week: 3 }
]
```

---

## Module 3 Example (Complete)

### Step 1: Open page3.html and find textareas
```html
<textarea id="m3lesson1essay" ...></textarea>
<textarea id="m3lesson2essay" ...></textarea>
<textarea id="m3lesson3essay" ...></textarea>
```

### Step 2: Count quiz questions
```html
<!-- Week 1 Quiz: 6 questions (q1-q6) -->
<!-- Week 2 Quiz: 5 questions (q1-q5) -->
<!-- Week 3 Quiz: 4 questions (q1-q4) -->
```

### Step 3: Update module-configs.js
```javascript
3: {
    moduleNumber: 3,
    title: "Module 3: Spiritual Foundations",
    essayFields: [
        { id: 'm3lesson1essay', week: 1 },
        { id: 'm3lesson2essay', week: 2 },
        { id: 'm3lesson3essay', week: 3 }
    ],
    totalLessons: 3,
    quizzes: {
        1: { totalQuestions: 6 },
        2: { totalQuestions: 5 },
        3: { totalQuestions: 4 }
    }
}
```

---

## What If There Are No Essays?

Some modules might not have essays, only quizzes. In that case:

```javascript
5: {
    moduleNumber: 5,
    title: "Module 5: Assessment Only",
    essayFields: [],  // ← Empty array
    totalLessons: 4,
    quizzes: {
        1: { totalQuestions: 6 },
        2: { totalQuestions: 5 },
        3: { totalQuestions: 7 },
        4: { totalQuestions: 6 }
    }
}
```

The system will skip essay auto-save for this module.

---

## What If There Are Extra Essays?

If a module has 4 essays instead of 3:

```javascript
7: {
    moduleNumber: 7,
    title: "Module 7: Extended Study",
    essayFields: [
        { id: 'essay1', week: 1 },
        { id: 'essay2', week: 2 },
        { id: 'essay3', week: 3 },
        { id: 'essay4', week: 4 }  // ← Extra essay
    ],
    totalLessons: 4,
    quizzes: {
        1: { totalQuestions: 6 },
        2: { totalQuestions: 5 },
        3: { totalQuestions: 7 },
        4: { totalQuestions: 6 }
    }
}
```

---

## Batch Update Method

To update all modules at once:

1. **Create a checklist:**
   - [ ] Module 1 - Gather data
   - [ ] Module 2 - Already done ✓
   - [ ] Module 3 - Gather data
   - ... etc

2. **Go through each page systematically:**
   - Open page1.html → Copy essay IDs → Count quiz questions
   - Open page3.html → Copy essay IDs → Count quiz questions
   - ... continue through page19.html

3. **Update module-configs.js in one batch:**
   - Replace all placeholder IDs with real ones
   - Replace all question counts with real ones

4. **Verify:**
   - Each module has correct essayFields array
   - Each quiz has correct totalQuestions
   - All IDs match the HTML

---

## Testing After Update

Once you update a module in configs:

```javascript
// Test in browser console:
import { getModuleConfig } from './module-configs.js';

const config = getModuleConfig(3);
console.log(config);
// Should show your updated config

// Check essay IDs
console.log(config.essayFields);
// Should match your HTML

// Check quiz counts
console.log(config.quizzes);
// Should match your HTML
```

---

## Final Checklist

Before moving to next step, verify:

- [ ] All 19 modules have entries in module-configs.js
- [ ] Each module has correct title
- [ ] essayFields array matches actual HTML textarea IDs
- [ ] Quiz question counts match actual HTML quizzes
- [ ] No placeholder IDs remain (like 'essay1', 'essay2')
- [ ] All modules tested with integration script

---

## Common Errors

### Error: "Cannot read property 'id' of undefined"
**Cause:** essayFields array is missing data
**Fix:** Verify essayFields in configs matches your HTML

### Error: "Quiz saving returns 0/10 score"
**Cause:** Question counts in configs don't match HTML
**Fix:** Recount questions and update totalQuestions

### Error: "Essays not auto-saving"
**Cause:** Essay field IDs in configs don't match HTML
**Fix:** Copy exact IDs from HTML textarea id attribute

---

## Time Estimate

- **Gather data for all 19 modules:** 30-45 minutes
- **Update module-configs.js:** 10-15 minutes
- **Total:** ~1 hour for complete configuration

---

See `SETUP-ALL-MODULES.md` for next steps after updating configs.
