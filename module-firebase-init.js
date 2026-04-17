/**
 * MODULE FIREBASE INTEGRATION - Universal Template
 * Use this for ALL modules (pages 1-19)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Change MODULE_NUMBER to match your page (1, 2, 3... 19)
 * 2. Update essay field IDs to match your HTML
 * 3. Update quiz configuration with your questions and correct answers
 * 4. Paste this script into your page as a type="module" script
 */

export async function initializeModuleFirebase(config) {
    const {
        moduleNumber,
        essayFields = [],      // [{ id: 'essayId', week: 1 }, ...]
        quizzes = {},          // { 1: { totalQuestions: 6, correctAnswers: {...} }, ... }
        totalLessons = 4,
        weekNumber = 1
    } = config;

    // Import Firebase functions
    const dbModule = await import('./firebase-database.js');
    const authModule = await import('./auth.js');

    const {
        saveNotes,
        getNotes,
        saveQuizResponse,
        saveModuleProgress,
        completeModule,
        recordStudySession
    } = dbModule;

    const { markModuleComplete } = authModule;

    let sessionStartTime = Date.now();

    // ============ AUTO-SAVE ESSAYS ============
    function setupAutoSaveEssays() {
        let saveTimeout;

        essayFields.forEach(field => {
            const textarea = document.getElementById(field.id);
            if (textarea) {
                textarea.addEventListener('input', () => {
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        saveNotes(moduleNumber, field.week, textarea.value).catch(err => {
                            console.error('Error auto-saving essay:', err);
                        });
                    }, 2000);
                });
            }
        });
    }

    // ============ LOAD SAVED ESSAYS ============
    async function loadSavedEssays() {
        for (const field of essayFields) {
            const textarea = document.getElementById(field.id);
            if (textarea) {
                try {
                    const notes = await getNotes(moduleNumber, field.week);
                    if (notes) textarea.value = notes;
                } catch (error) {
                    console.error('Error loading essay:', error);
                }
            }
        }
    }

    // ============ SAVE ALL ESSAYS ============
    async function saveAllEssays() {
        const essays = {};
        essayFields.forEach(field => {
            essays[field.week] = document.getElementById(field.id)?.value || '';
        });

        for (const [week, content] of Object.entries(essays)) {
            try {
                await saveNotes(moduleNumber, week, content);
            } catch (error) {
                console.error(`Error saving essay week ${week}:`, error);
            }
        }
    }

    // ============ QUIZ RESPONSE HANDLER ============
    async function saveQuizResponseToFirebase(weekNumber, answers, score, totalQuestions) {
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
    }

    // ============ RECORD SESSION & COMPLETE MODULE ============
    window.handleModuleComplete = function(event) {
        event.preventDefault();
        const target = event.currentTarget.href || event.target.href;

        // Show saving status
        const btnText = document.getElementById('btnText');
        const btnLoading = document.getElementById('btnLoading');
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';

        const durationMinutes = Math.round((Date.now() - sessionStartTime) / 60000);

        Promise.all([
            saveAllEssays(),
            completeModule(moduleNumber),
            recordStudySession({
                moduleNumber: moduleNumber,
                durationMinutes: durationMinutes,
                completedAt: new Date().toISOString()
            })
        ]).then(() => {
            setTimeout(() => window.location.href = target, 500);
        }).catch(err => {
            console.error('Error completing module:', err);
            setTimeout(() => window.location.href = target, 500);
        });
    };

    // ============ UPDATE PROGRESS ============
    async function updateModuleProgress() {
        try {
            await saveModuleProgress(moduleNumber, {
                currentLesson: 1,
                currentWeek: weekNumber,
                progress: 0.25,
                lastAccessedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    // ============ INITIALIZATION ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            setupAutoSaveEssays();
            await loadSavedEssays();
            await updateModuleProgress();
        });
    } else {
        setupAutoSaveEssays();
        await loadSavedEssays();
        await updateModuleProgress();
    }

    // ============ MAKE FUNCTIONS GLOBAL ============
    window.saveQuizResponseToFirebase = saveQuizResponseToFirebase;
    window.saveAllEssays = saveAllEssays;

    return {
        saveQuizResponseToFirebase,
        saveAllEssays,
        loadSavedEssays,
        updateModuleProgress
    };
}
