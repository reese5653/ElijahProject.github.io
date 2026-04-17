// Quick Copy-Paste Template for Adding Firebase Database to Your Pages
// Use this as a starting point for pages 3-19

/**
 * INSTRUCTIONS:
 * 1. Replace all instances of MODULE_NUMBER with your module number (3, 4, 5, etc)
 * 2. Replace essay/quiz IDs with your actual HTML element IDs
 * 3. Update correctAnswers object with your quiz answers
 * 4. Paste the entire script into your page
 */

// ============ COPY THIS INTO YOUR PAGE ============

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

    const MODULE_NUMBER = 3; // ← CHANGE THIS TO YOUR MODULE NUMBER
    let sessionStartTime = Date.now();

    // ========== ESSAYS / NOTES SECTION ==========

    function setupAutoSaveEssays() {
        // Update these IDs to match your textareas
        const essayFields = ['essayId1', 'essayId2', 'essayId3'];
        let saveTimeout;
        
        essayFields.forEach(fieldId => {
            const textarea = document.getElementById(fieldId);
            if (textarea) {
                textarea.addEventListener('input', () => {
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        const weekNum = fieldId.match(/\d+$/)[0]; // Extract number from ID
                        saveNotes(MODULE_NUMBER, weekNum, textarea.value);
                    }, 2000); // Auto-save 2 seconds after typing stops
                });
            }
        });
    }

    async function loadSavedEssays() {
        // Update the essay field mappings
        const essayFields = [
            { id: 'essayId1', week: 1 },
            { id: 'essayId2', week: 2 },
            { id: 'essayId3', week: 3 }
        ];
        
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

    async function saveAllEssays() {
        const essays = {
            1: document.getElementById('essayId1')?.value || '',
            2: document.getElementById('essayId2')?.value || '',
            3: document.getElementById('essayId3')?.value || ''
        };
        
        for (let i = 1; i <= 3; i++) {
            try {
                await saveNotes(MODULE_NUMBER, i, essays[i]);
            } catch (error) {
                console.error(`Error saving essay ${i}:`, error);
            }
        }
    }

    // ========== QUIZ SECTION ==========

    // Helper function - use this for all quiz submissions
    window.saveQuizResponseToFirebase = async (moduleNumber, weekNumber, answers, score, totalQuestions) => {
        try {
            await saveQuizResponse(moduleNumber, weekNumber, {
                answers: answers,
                score: score,
                totalQuestions: totalQuestions,
                passingScore: 70,
                passed: score >= 70,
                completed: true
            });
            console.log(`✓ Quiz ${moduleNumber}.${weekNumber} saved to Firebase`);
        } catch (error) {
            console.error('Error saving quiz response:', error);
        }
    };

    // ========== MODULE COMPLETION ==========

    window.handleModuleComplete = function(event, moduleNumber) {
        event.preventDefault();
        const target = event.currentTarget.href || event.target.href;
        
        // Show saving status
        const btnText = document.getElementById('btnText');
        const btnLoading = document.getElementById('btnLoading');
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';
        
        // Save all data before navigating
        Promise.all([
            saveAllEssays(),
            completeModule(moduleNumber),
            recordStudySessionOnComplete()
        ]).then(() => {
            setTimeout(() => window.location.href = target, 500);
        }).catch(err => {
            console.error('Error completing module:', err);
            setTimeout(() => window.location.href = target, 500);
        });
    };

    async function recordStudySessionOnComplete() {
        const durationMinutes = Math.round((Date.now() - sessionStartTime) / 60000);
        try {
            await recordStudySession({
                moduleNumber: MODULE_NUMBER,
                durationMinutes: durationMinutes,
                completedAt: new Date().toISOString()
            });
            console.log(`✓ Session recorded: ${durationMinutes} minutes`);
        } catch (error) {
            console.error('Error recording session:', error);
        }
    }

    // ========== UPDATE MODULE PROGRESS ==========

    async function updateModuleProgress() {
        try {
            await saveModuleProgress(MODULE_NUMBER, {
                currentLesson: 1,
                currentWeek: 1,
                progress: 0.25, // 25% for lesson 1 of 4 lessons
                lastAccessedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    // ========== INITIALIZATION ==========

    document.addEventListener('DOMContentLoaded', () => {
        setupAutoSaveEssays();
        loadSavedEssays();
        updateModuleProgress();
    });
</script>

// ============ END COPY ============

/**
 * EXAMPLE: How to use saveQuizResponseToFirebase in your quiz submit function
 * 
 * function submitMyQuiz() {
 *     let score = 0;
 *     const totalQuestions = 5;
 *     const correctAnswers = { q1: 'a', q2: 'b', q3: 'true', q4: 'c', q5: 'd' };
 *     
 *     // Collect answers
 *     const answers = [];
 *     for (let i = 1; i <= totalQuestions; i++) {
 *         const selected = document.querySelector(`input[name="q${i}"]:checked`)?.value;
 *         if (selected === correctAnswers[`q${i}`]) score++;
 *         
 *         answers.push({
 *             questionId: i,
 *             selectedAnswer: selected || '',
 *             correctAnswer: correctAnswers[`q${i}`]
 *         });
 *     }
 *     
 *     // Calculate percentage
 *     const percentage = Math.round((score / totalQuestions) * 100);
 *     console.log(`Score: ${percentage}%`);
 *     
 *     // Save to Firebase
 *     window.saveQuizResponseToFirebase(
 *         MODULE_NUMBER,    // Your module number
 *         1,                // Week number (1, 2, 3, etc)
 *         answers,          // Array of answer objects
 *         percentage,       // Score as percentage (0-100)
 *         totalQuestions    // Total questions
 *     );
 * }
 */

/**
 * TESTING IN BROWSER CONSOLE
 * 
 * // Check if essays are saved to localStorage
 * localStorage.getItem('module_3_week_1')
 * 
 * // Check if quiz is marked complete
 * localStorage.getItem('quiz_3_1_completed')
 * 
 * // Clear localStorage (if needed)
 * localStorage.clear()
 * 
 * // Check current user ID
 * import('./auth.js').then(m => m.getCurrentUser()).then(u => console.log(u.uid))
 */
