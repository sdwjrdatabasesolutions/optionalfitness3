import { getUser, login, logout, saveUser, updatePaymentStatus } from './auth.js';
import { renderPayPalButton } from './payment.js';

const lessons = [
    { id: 1, title: "SQL Basics", locked: false, content: "Introduction to SQL..." },
    { id: 2, title: "Filtering Data", locked: false, content: "WHERE clause..." },
    { id: 3, title: "Sorting & Joins", locked: true, content: "JOIN operations..." },
    { id: 4, title: "Advanced SQL", locked: true, content: "Subqueries, indexes..." }
];

const lessonList = document.getElementById('lessonList');
const content = document.getElementById('content');

function renderLessons() {
    const user = getUser();
    lessonList.innerHTML = '';
    
    lessons.forEach(lesson => {
        const li = document.createElement('li');
        li.textContent = lesson.title;
        li.style.cursor = "pointer";
        li.style.padding = "8px";
        li.style.margin = "4px 0";
        li.style.backgroundColor = "#f0f0f0";
        li.style.borderRadius = "4px";
        
        // Add lock icon if locked
        if (lesson.locked && (!user || !user.is_paid)) {
            li.style.opacity = "0.6";
            li.innerHTML += ' 🔒';
        } else {
            li.style.backgroundColor = "#e0e0e0";
        }
        
        li.onclick = () => loadLesson(lesson.id);
        lessonList.appendChild(li);
    });
}

function loadLesson(id) {
    const user = getUser();
    const lesson = lessons.find(l => l.id === id);
    
    if (!lesson) {
        content.innerHTML = '<p>Lesson not found</p>';
        return;
    }
    
    // Check if lesson is locked
    if (lesson.locked && (!user || !user.is_paid)) {
        content.innerHTML = `
            <h2>🔒 Premium Content</h2>
            <p>This lesson requires payment to unlock.</p>
            <p><strong>${lesson.title}</strong> is available after payment.</p>
            <div id="paypal-button-container"></div>
        `;
        renderPayPalButton();
        return;
    }
    
    // Display lesson content
    content.innerHTML = `
        <h2>${lesson.title}</h2>
        <p>${lesson.content}</p>
        <div class="lesson-navigation">
            <button onclick="previousLesson(${id})">Previous</button>
            <button onclick="nextLesson(${id})">Next</button>
        </div>
    `;
    
    // Mark as completed if user is logged in
    if (user && !user.completedModules.includes(id)) {
        user.completedModules.push(id);
        saveUser(user);
        checkCertificate(user);
    }
}

function previousLesson(currentId) {
    const prevLesson = lessons.find(l => l.id === currentId - 1);
    if (prevLesson) loadLesson(prevLesson.id);
}

function nextLesson(currentId) {
    const nextLesson = lessons.find(l => l.id === currentId + 1);
    if (nextLesson) loadLesson(nextLesson.id);
}

function checkCertificate(user) {
    const completedCount = user.completedModules.length;
    const totalLessons = lessons.length;
    const allUnlocked = lessons.every(lesson => 
        !lesson.locked || user.is_paid
    );
    
    if (completedCount === totalLessons && allUnlocked) {
        const certificateDiv = document.createElement('div');
        certificateDiv.innerHTML = `
            <div style="margin-top: 20px; padding: 20px; background: #e8f5e9; border-radius: 8px;">
                <h3>🎓 Congratulations ${user.email}!</h3>
                <p>You have completed all ${totalLessons} lessons!</p>
                <button onclick="downloadCertificate()">📜 Download Certificate</button>
            </div>
        `;
        content.appendChild(certificateDiv);
    }
}

window.downloadCertificate = function() {
    const user = getUser();
    if (!user) return;
    
    const certificate = `
        CERTIFICATE OF COMPLETION
        This certifies that ${user.email}
        has completed the SQL Learning Course
        Date: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([certificate], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'certificate.txt';
    link.click();
    URL.revokeObjectURL(link.href);
};

// Event listeners
document.getElementById('loginBtn').onclick = () => { 
    const user = login(); 
    if (user) renderLessons();
};

document.getElementById('logoutBtn').onclick = () => logout();

// Listen for payment updates
window.addEventListener('paymentUpdated', () => {
    renderLessons();
    // Reload current lesson if it was locked
    const currentLessonId = getCurrentLessonId();
    if (currentLessonId) loadLesson(currentLessonId);
});

function getCurrentLessonId() {
    // Extract from content or maintain state
    return null;
}

// Initialize
renderLessons();