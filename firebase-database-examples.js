// firebase-database-examples.js
// Practical integration examples for using the Firebase database module

import { 
  saveModuleProgress, 
  getModuleProgress,
  completeModule, 
  saveQuizResponse,
  getQuizResponse,
  saveNotes,
  getNotes,
  addBookmark,
  saveUserSettings,
  recordStudySession,
  awardCertificate,
  getCurrentUser
} from './firebase-database.js';

/**
 * EXAMPLE 1: Track User Progress Through Lessons
 * Call this when user moves to next lesson
 */
export async function trackLessonProgress(moduleNumber, weekNumber, lessonNumber, totalLessons) {
  const startTime = Date.now();
  
  // Store lesson start time in sessionStorage
  sessionStorage.setItem(`lesson_${moduleNumber}_start`, startTime);
  
  // Update progress
  const progressPercentage = (lessonNumber / totalLessons) * 100;
  
  await saveModuleProgress(moduleNumber, {
    currentWeek: weekNumber,
    currentLesson: lessonNumber,
    progress: progressPercentage / 100,
    lastAccessedAt: new Date().toISOString()
  });
  
  console.log(`✓ Progress saved: Module ${moduleNumber}, Week ${weekNumber}, Lesson ${lessonNumber}`);
}

/**
 * EXAMPLE 2: Save Quiz Responses When User Submits Quiz
 * Call this when user clicks "Submit Quiz"
 */
export async function submitQuiz(moduleNumber, weekNumber, quizAnswers) {
  // Calculate score
  const score = calculateQuizScore(quizAnswers);
  const passingScore = 70;
  const passed = score >= passingScore;
  
  // Save quiz response
  await saveQuizResponse(moduleNumber, weekNumber, {
    answers: quizAnswers,
    score: score,
    totalQuestions: quizAnswers.length,
    passingScore: passingScore,
    passed: passed,
    attemptNumber: (await getQuizAttempts(moduleNumber, weekNumber)) + 1,
    completed: true
  });
  
  console.log(`✓ Quiz submitted - Score: ${score}/${100}, Passed: ${passed}`);
  
  return { score, passed };
}

/**
 * Helper: Calculate quiz score
 */
function calculateQuizScore(answers) {
  // Example scoring logic
  let correctAnswers = 0;
  
  answers.forEach(answer => {
    if (answer.selectedAnswer === answer.correctAnswer) {
      correctAnswers++;
    }
  });
  
  return Math.round((correctAnswers / answers.length) * 100);
}

/**
 * Helper: Get number of quiz attempts
 */
async function getQuizAttempts(moduleNumber, weekNumber) {
  const response = await getQuizResponse(moduleNumber, weekNumber);
  return response ? response.attemptNumber || 1 : 0;
}

/**
 * EXAMPLE 3: Auto-Save User Notes While Typing
 * Use with textarea event listeners
 */
export function setupAutoSaveNotes(moduleNumber, weekNumber, textareaElement) {
  let saveTimeout;
  
  textareaElement.addEventListener('input', async (e) => {
    // Clear previous timeout
    clearTimeout(saveTimeout);
    
    // Debounce: wait 2 seconds after user stops typing before saving
    saveTimeout = setTimeout(async () => {
      const noteContent = e.target.value;
      
      // Show saving indicator
      const indicator = textareaElement.nextElementSibling;
      if (indicator) indicator.textContent = "Saving...";
      
      try {
        await saveNotes(moduleNumber, weekNumber, noteContent);
        if (indicator) indicator.textContent = "✓ Saved";
        setTimeout(() => { 
          if (indicator) indicator.textContent = ""; 
        }, 2000);
      } catch (error) {
        if (indicator) indicator.textContent = "Save failed";
      }
    }, 2000);
  });
}

/**
 * EXAMPLE 4: Load User Notes When Lesson Loads
 */
export async function loadAndDisplayNotes(moduleNumber, weekNumber, textareaElement) {
  try {
    const notes = await getNotes(moduleNumber, weekNumber);
    textareaElement.value = notes;
    console.log("✓ Notes loaded");
  } catch (error) {
    console.error("Failed to load notes:", error);
  }
}

/**
 * EXAMPLE 5: Add Bookmark When User Clicks "Save" Button
 */
export async function saveAsBookmark(moduleNumber, weekNumber, pageTitle, quoteText) {
  await addBookmark({
    id: `bookmark_${moduleNumber}_${weekNumber}_${Date.now()}`,
    type: "lesson",
    moduleNumber: moduleNumber,
    weekNumber: weekNumber,
    title: pageTitle,
    quoteText: quoteText,
    url: window.location.pathname,
    savedOn: new Date().toISOString()
  });
  
  console.log("✓ Bookmarked!");
  return { success: true };
}

/**
 * EXAMPLE 6: Track Study Time and Record Session
 */
export async function recordStudySessionOnPageUnload(moduleNumber, weekNumber) {
  const sessionStartTime = sessionStorage.getItem(`session_start_${moduleNumber}_${weekNumber}`);
  
  if (sessionStartTime) {
    const durationMinutes = Math.round((Date.now() - parseInt(sessionStartTime)) / 60000);
    
    if (durationMinutes > 0) {
      await recordStudySession({
        moduleNumber: moduleNumber,
        weekNumber: weekNumber,
        durationMinutes: durationMinutes,
        completedAt: new Date().toISOString()
      });
      
      console.log(`✓ Study session recorded: ${durationMinutes} minutes`);
    }
  }
}

/**
 * EXAMPLE 7: Mark Module Complete and Award Certificate
 */
export async function completeModuleAndAwardCertificate(moduleNumber, moduleName) {
  // Mark module as complete
  await completeModule(moduleNumber);
  
  // Award certificate
  const user = getCurrentUser();
  const certificateNumber = `EP-2026-${moduleNumber}-${user.uid.substring(0, 8)}-${Date.now()}`;
  
  await awardCertificate(moduleNumber, {
    title: moduleName,
    certificateNumber: certificateNumber,
    completedDate: new Date().toISOString(),
    instructorName: "Elijah Project School of Ministry",
    displayName: "Certificate of Completion"
  });
  
  console.log(`✓ Module ${moduleNumber} completed! Certificate awarded.`);
  return { certificateNumber };
}

/**
 * EXAMPLE 8: Update User Progress UI from Firebase
 */
export async function updateProgressUI(moduleNumber, containerElement) {
  const progress = await getModuleProgress(moduleNumber);
  
  if (!progress) {
    containerElement.innerHTML = "No progress data";
    return;
  }
  
  const progressPercentage = Math.round((progress.progress || 0) * 100);
  
  containerElement.innerHTML = `
    <div class="progress-display">
      <div class="progress-info">
        <span>Module ${moduleNumber}</span>
        <span class="percentage">${progressPercentage}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
      <div class="progress-details">
        <small>Week: ${progress.currentWeek || 1}</small>
        <small>Lesson: ${progress.currentLesson || 1}</small>
      </div>
    </div>
  `;
}

/**
 * EXAMPLE 9: Load Quiz Draft When Returning to Incomplete Quiz
 */
export async function loadQuizDraft(moduleNumber, weekNumber, quizFormElement) {
  const draft = await getQuizResponse(moduleNumber, weekNumber);
  
  if (draft && !draft.completed) {
    // Ask user if they want to resume
    const resume = confirm("Resume your previous quiz attempt?");
    
    if (resume) {
      // Restore quiz answers
      draft.answers.forEach(answer => {
        const input = quizFormElement.querySelector(`[data-question-id="${answer.questionId}"]`);
        if (input) {
          input.value = answer.selectedAnswer;
        }
      });
      console.log("✓ Quiz draft restored");
    } else {
      // Clear draft and start fresh
      quizFormElement.reset();
    }
  }
}

/**
 * EXAMPLE 10: Dashboard - Show User Statistics
 */
export async function displayDashboardStats(containerElement) {
  const profile = await fetch('./firebase-database.js').then(async () => {
    // Import functions to get stats
    const { getUserProfile, getCompletedModuleCount, getCertificates } = await import('./firebase-database.js');
    
    const profile = await getUserProfile();
    const completedCount = await getCompletedModuleCount();
    const certificates = await getCertificates();
    
    return { profile, completedCount, certificates };
  });
  
  containerElement.innerHTML = `
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Modules Completed</h3>
        <p class="stat-number">${profile.completedCount || 0}</p>
      </div>
      <div class="stat-card">
        <h3>Certificates Earned</h3>
        <p class="stat-number">${profile.certificates?.length || 0}</p>
      </div>
      <div class="stat-card">
        <h3>Member Since</h3>
        <p class="stat-detail">${new Date(profile.profile?.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  `;
}

/**
 * EXAMPLE 11: Setup Page for Module Learning
 */
export async function setupModulePage(moduleNumber, weekNumber) {
  // Record session start
  sessionStorage.setItem(`session_start_${moduleNumber}_${weekNumber}`, Date.now());
  
  // Load saved notes
  const notesElement = document.getElementById('notes-textarea');
  if (notesElement) {
    await loadAndDisplayNotes(moduleNumber, weekNumber, notesElement);
    setupAutoSaveNotes(moduleNumber, weekNumber, notesElement);
  }
  
  // Setup quiz if present
  const quizForm = document.getElementById('quiz-form');
  if (quizForm) {
    await loadQuizDraft(moduleNumber, weekNumber, quizForm);
    
    quizForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const answers = Array.from(quizForm.querySelectorAll('input[type="radio"]:checked')).map(input => ({
        questionId: input.name,
        selectedAnswer: input.value,
        correctAnswer: input.dataset.correct // You'd set this in HTML
      }));
      
      const result = await submitQuiz(moduleNumber, weekNumber, answers);
      
      if (result.passed) {
        alert(`Great job! You passed with ${result.score}%`);
        // Check if module is complete and show certificate option
      } else {
        alert(`You scored ${result.score}%. Passing score is 70%.`);
      }
    });
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    recordStudySessionOnPageUnload(moduleNumber, weekNumber);
  });
}

/**
 * EXAMPLE 12: Responsive Lesson Navigation
 */
export async function setupLessonNavigation(moduleNumber, weekNumber, totalLessons) {
  const nextBtn = document.getElementById('next-lesson-btn');
  const prevBtn = document.getElementById('prev-lesson-btn');
  
  let currentLesson = (await getModuleProgress(moduleNumber))?.currentLesson || 1;
  
  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      if (currentLesson < totalLessons) {
        currentLesson++;
        await trackLessonProgress(moduleNumber, weekNumber, currentLesson, totalLessons);
        window.location.href = `?lesson=${currentLesson}`;
      }
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', async () => {
      if (currentLesson > 1) {
        currentLesson--;
        await trackLessonProgress(moduleNumber, weekNumber, currentLesson, totalLessons);
        window.location.href = `?lesson=${currentLesson}`;
      }
    });
  }
}

/**
 * EXAMPLE 13: Export User Data for Download (GDPR)
 */
export async function downloadUserData() {
  const { exportUserData } = await import('./firebase-database.js');
  
  const data = await exportUserData();
  const json = JSON.stringify(data, null, 2);
  
  // Create blob and trigger download
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elijah-project-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log("✓ Data exported");
}

/**
 * EXAMPLE 14: Setup Offline Sync
 */
export function setupOfflineSync() {
  window.addEventListener('online', async () => {
    console.log("✓ Connection restored");
    const { syncLocalDataToFirebase } = await import('./firebase-database.js');
    await syncLocalDataToFirebase();
  });
  
  window.addEventListener('offline', () => {
    console.log("⚠ Connection lost - using offline mode");
    // Show user a message
    const notification = document.getElementById('offline-notification');
    if (notification) notification.style.display = 'block';
  });
}

/**
 * HTML Usage Examples
 * 
 * 1. For Quiz Page:
 * <form id="quiz-form">
 *   <div class="question">
 *     <p>Question 1: What is the first book of the Bible?</p>
 *     <input type="radio" name="q1" value="A" data-correct="true"> Genesis
 *     <input type="radio" name="q1" value="B"> Exodus
 *   </div>
 *   <button type="submit">Submit Quiz</button>
 * </form>
 * 
 * 2. For Notes Section:
 * <textarea id="notes-textarea" placeholder="Take notes..."></textarea>
 * <span id="save-indicator"></span>
 * 
 * 3. For Progress Display:
 * <div id="progress-container"></div>
 * 
 * 4. Initialize on page:
 * <script type="module">
 *   import { setupModulePage } from './firebase-database-examples.js';
 *   setupModulePage(2, 1); // Module 2, Week 1
 * </script>
 */
