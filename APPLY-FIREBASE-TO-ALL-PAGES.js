/**
 * UNIVERSAL MODULE FIREBASE INTEGRATION
 * 
 * Add this script to ALL module pages (pages 1-19)
 * Simply change the MODULE_NUMBER constant at the top
 * 
 * INSTRUCTIONS:
 * 1. Copy entire <script type="module"> section below
 * 2. Paste into your page's HTML file
 * 3. Change MODULE_NUMBER = X (1, 2, 3... 19)
 * 4. Run and test
 */

// ============================================================
// COPY-PASTE THIS ENTIRE BLOCK INTO YOUR PAGE
// ============================================================

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

    // ========== CONFIGURATION ==========
    const MODULE_NUMBER = 2; // ← CHANGE THIS TO YOUR MODULE NUMBER (1-19)

    // Load config for this module
    const config = getModuleConfig(MODULE_NUMBER);
    const essayFields = config.essayFields || [];
    
    let sessionStartTime = Date.now();

    console.log(`✓ Initializing Module ${MODULE_NUMBER}: ${config.title}`);

    // ========== AUTO-SAVE ESSAYS ==========
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
        
        console.log(`✓ Auto-save configured for ${essayFields.length} essay fields`);
    }

    // ========== LOAD SAVED ESSAYS ==========
    async function loadSavedEssays() {
        for (const field of essayFields) {
            const textarea = document.getElementById(field.id);
            if (textarea) {
                try {
                    const notes = await getNotes(MODULE_NUMBER, field.week);
                    if (notes) {
                        textarea.value = notes;
                        console.log(`✓ Loaded saved essay for Week ${field.week}`);
                    }
                } catch (error) {
                    console.error('Error loading essay:', error);
                }
            }
        }
    }

    // ========== SAVE ALL ESSAYS ==========
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
        console.log('✓ All essays saved to Firebase');
    }

    // ========== QUIZ RESPONSE HANDLER ==========
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
            console.log(`✓ Quiz ${MODULE_NUMBER}.${weekNumber} saved to Firebase`);
        } catch (error) {
            console.error('Error saving quiz:', error);
        }
    };

    // ========== MODULE COMPLETION ==========
    window.handleModuleComplete = function(event) {
        event.preventDefault();
        const target = event.currentTarget.href || event.target.href;

        // Show saving indicator
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
            console.log(`✓ Module ${MODULE_NUMBER} completed`);
            setTimeout(() => window.location.href = target, 500);
        }).catch(err => {
            console.error('Error completing module:', err);
            setTimeout(() => window.location.href = target, 500);
        });
    };

    // ========== UPDATE PROGRESS ==========
    async function updateModuleProgress() {
        try {
            await saveModuleProgress(MODULE_NUMBER, {
                currentLesson: 1,
                currentWeek: 1,
                progress: 0.25,
                lastAccessedAt: new Date().toISOString()
            });
            console.log(`✓ Module progress updated`);
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    // ========== INITIALIZATION ==========
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

// ============================================================
// HOW TO USE THIS IN YOUR QUIZ SUBMIT FUNCTIONS
// ============================================================

// In each quiz submit function, add this code:

function submitYourQuiz() {
    let score = 0;
    const totalQuestions = 6;
    const correctAnswers = { q1: 'a', q2: 'b', q3: 'true', q4: 'c', q5: 'd', q6: 'a' };
    
    // Collect answers
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
    
    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // SAVE TO FIREBASE - Call this function
    window.saveQuizResponseToFirebase(1, answers, percentage, totalQuestions);
    
    // ... rest of your quiz logic ...
}

// ============================================================
// EXAMPLE: Button for Manual Save
// ============================================================

// Add this HTML to allow manual saves:
//<button onclick="saveAllEssays()" style="...">Save All Answers</button>

// Add this to your script:
// window.saveAllEssays = saveAllEssays;
