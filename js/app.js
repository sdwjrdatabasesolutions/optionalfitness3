// app.js
import { getUser, login, logout, saveUser, updatePaymentStatus, onUserChanged } from './auth.js';
import { renderPayPalButton } from './payment.js';

const lessons = [
    { id: 1, title: "SQL Basics", locked: false, content: "Introduction to SQL: Learn SELECT, FROM, and basic queries." },
    { id: 2, title: "Filtering Data", locked: false, content: "Using WHERE clause, AND, OR, IN, BETWEEN, LIKE operators." },
    { id: 3, title: "Sorting & Joins", locked: true, content: "ORDER BY, INNER JOIN, LEFT JOIN, RIGHT JOIN, and table relationships." },
    { id: 4, title: "Advanced SQL", locked: true, content: "Subqueries, indexes, views, stored procedures, and optimization." }
];

const lessonList = document.getElementById('lessonList');
const content = document.getElementById('content');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const startLearningBtn = document.getElementById('startLearningBtn');

// Helper to get current user safely
function getCurrentUser() {
    const user = getUser();
    // Ensure user has required properties
    if (user && typeof user.completedModules === 'undefined') {
        user.completedModules = [];
    }
    if (user && typeof user.is_paid === 'undefined') {
        user.is_paid = false;
    }
    return user;
}

// Listen to Firebase auth changes
if (typeof onUserChanged === 'function') {
    onUserChanged(user => {
        if (user) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
        renderLessons();
        updateProgressBar();
        
        // Show welcome or last viewed lesson
        if (user && user.lastViewedLesson) {
            loadLesson(user.lastViewedLesson);
        } else {
            showWelcomeMessage();
        }
    });
}

// Event listeners
if (loginBtn) loginBtn.onclick = async () => await login();
if (logoutBtn) logoutBtn.onclick = async () => await logout();
if (startLearningBtn) startLearningBtn.onclick = () => {
    const user = getCurrentUser();
    if (user) {
        loadLesson(1);
    } else {
        alert('Please login first to start learning.');
        login();
    }
};

function renderLessons() {
    const user = getCurrentUser();
    if (!lessonList) return;
    
    lessonList.innerHTML = '';
    
    lessons.forEach(lesson => {
        const li = document.createElement('li');
        li.textContent = lesson.title;

        // Check if lesson is locked (premium content)
        const isPremiumLocked = lesson.locked && (!user || !user.is_paid);
        
        if (isPremiumLocked) {
            li.classList.add('locked');
            const lockSpan = document.createElement('span');
            lockSpan.textContent = ' 🔒';
            li.appendChild(lockSpan);
        } else if (user && user.completedModules && user.completedModules.includes(lesson.id)) {
            li.classList.add('completed');
            const checkSpan = document.createElement('span');
            checkSpan.textContent = ' ✓';
            li.appendChild(checkSpan);
        }

        li.onclick = () => loadLesson(lesson.id);
        lessonList.appendChild(li);
    });
}

function showWelcomeMessage() {
    if (!content) return;
    content.innerHTML = `
        <div class="welcome-message">
            <h2>🎯 Welcome to SQL Course</h2>
            <p>Master SQL from fundamentals to advanced concepts!</p>
            <div class="features">
                <div class="feature">
                    <span>✅</span>
                    <span>Interactive Lessons</span>
                </div>
                <div class="feature">
                    <span>💻</span>
                    <span>Hands-on Exercises</span>
                </div>
                <div class="feature">
                    <span>🎓</span>
                    <span>Certificate on Completion</span>
                </div>
            </div>
            <button id="welcomeStartBtn" class="btn-primary">Start Learning Now →</button>
        </div>
    `;
    const welcomeStartBtn = document.getElementById('welcomeStartBtn');
    if (welcomeStartBtn) {
        welcomeStartBtn.onclick = () => {
            const user = getCurrentUser();
            if (user) {
                loadLesson(1);
            } else {
                alert('Please login first to start learning.');
                login();
            }
        };
    }
}

function loadLesson(id) {
    const user = getCurrentUser();
    const lesson = lessons.find(l => l.id === id);

    if (!lesson) {
        if (content) content.innerHTML = '<p>Lesson not found</p>';
        return;
    }

    // Save last viewed lesson
    if (user) {
        user.lastViewedLesson = id;
        saveUser(user);
    }

    // Check if lesson requires payment
    if (lesson.locked && (!user || !user.is_paid)) {
        if (content) {
            content.innerHTML = `
                <div class="lesson-content">
                    <h2>🔒 Premium Content: ${lesson.title}</h2>
                    <p>This lesson requires payment to unlock.</p>
                    <p>Complete your purchase to access all premium lessons including:</p>
                    <ul>
                        <li>${lessons.filter(l => l.locked).map(l => l.title).join(', ')}</li>
                    </ul>
                    <div id="paypal-button-container"></div>
                </div>
            `;
            if (typeof renderPayPalButton === 'function') {
                renderPayPalButton(async () => {
                    if (typeof updatePaymentStatus === 'function') {
                        await updatePaymentStatus(true);
                        renderLessons();
                        loadLesson(id);
                    }
                });
            } else {
                content.innerHTML += '<p style="color:red;">Payment system unavailable. Please contact support.</p>';
            }
        }
        return;
    }

    // Display lesson content
    if (content) {
        content.innerHTML = `
            <div class="lesson-content">
                <h2>${lesson.title}</h2>
                <p>${lesson.content}</p>
                <div class="lesson-navigation">
                    <button id="prevLessonBtn" class="btn-primary">← Previous</button>
                    <button id="nextLessonBtn" class="btn-primary">Next →</button>
                </div>
            </div>
        `;
        
        const prevBtn = document.getElementById('prevLessonBtn');
        const nextBtn = document.getElementById('nextLessonBtn');
        
        if (prevBtn) prevBtn.onclick = () => previousLesson(id);
        if (nextBtn) nextBtn.onclick = () => nextLesson(id);
    }

    // Mark as completed if not already
    if (user && user.completedModules && !user.completedModules.includes(id)) {
        user.completedModules.push(id);
        saveUser(user);
        updateProgressBar();
        renderLessons(); // Refresh lesson list to show checkmark
        checkCertificate(user);
    }
}

function previousLesson(currentId) {
    const prevLesson = lessons.find(l => l.id === currentId - 1);
    if (prevLesson) {
        loadLesson(prevLesson.id);
    } else {
        alert('This is the first lesson.');
    }
}

function nextLesson(currentId) {
    const nextLesson = lessons.find(l => l.id === currentId + 1);
    if (nextLesson) {
        loadLesson(nextLesson.id);
    } else {
        alert('Congratulations! You have completed all available lessons.');
    }
}

function checkCertificate(user) {
    if (!user || !user.completedModules) return;
    
    const totalLessons = lessons.length;
    const completedCount = user.completedModules.length;
    
    if (completedCount === totalLessons && user.is_paid) {
        // Check if certificate already shown
        if (document.getElementById('certificateSection')) return;
        
        const certDiv = document.createElement('div');
        certDiv.id = 'certificateSection';
        certDiv.innerHTML = `
            <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #f5f0e6 0%, #fff5e6 100%); border-radius: 12px; text-align: center; border: 2px solid #f39c12;">
                <h3>🎓 Congratulations ${user.email || 'Student'}!</h3>
                <p>You have completed all lessons in the SQL course!</p>
                <button id="downloadCertBtn" class="btn-primary">📜 Download Certificate</button>
            </div>
        `;
        if (content) content.appendChild(certDiv);
        
        const downloadBtn = document.getElementById('downloadCertBtn');
        if (downloadBtn) {
            downloadBtn.onclick = () => downloadCertificate();
        }
    }
}

function downloadCertificate() {
    const user = getCurrentUser();
    if (!user) {
        alert('User not found.');
        return;
    }
    
    const completedModules = user.completedModules || [];
    const totalModules = lessons.length;
    const percentComplete = Math.round((completedModules.length / totalModules) * 100);
    
    const certificateContent = `
========================================
      SQL LEARNING PLATFORM
      CERTIFICATE OF COMPLETION
========================================

This certifies that

      ${user.email || 'Student'}

has successfully completed the

      SQL from Beginner to Advanced Course

Completed Modules: ${completedModules.length}/${totalModules} (${percentComplete}%)
Completion Date: ${new Date().toLocaleDateString()}
Certificate ID: ${Date.now()}-${Math.random().toString(36).substr(2, 8)}

========================================
      Authorized Signature
      SQL Learning Platform
========================================
    `;
    
    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `SQL_Certificate_${user.email || 'student'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function updateProgressBar() {
    const user = getCurrentUser();
    if (!user || !user.completedModules) {
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = '0% complete';
        return;
    }

    const completed = user.completedModules.length;
    const total = lessons.length;
    const percent = Math.round((completed / total) * 100);

    if (progressFill) progressFill.style.width = percent + '%';
    if (progressText) progressText.textContent = percent + '% complete (Login to save progress)';
    
    if (user && user.email) {
        progressText.textContent = percent + '% complete';
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderLessons();
        updateProgressBar();
        showWelcomeMessage();
    });
} else {
    renderLessons();
    updateProgressBar();
    showWelcomeMessage();
}
