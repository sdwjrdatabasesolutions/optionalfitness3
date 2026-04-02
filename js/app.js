// app.js
import { getUser, login, logout, updatePaymentStatus, onUserChanged } from './auth.js';
import { renderPayPalButton } from './payment.js';

const lessons = [
    { id: 1, title: "SQL Basics", locked: false, content: "Introduction to SQL..." },
    { id: 2, title: "Filtering Data", locked: false, content: "WHERE clause..." },
    { id: 3, title: "Sorting & Joins", locked: true, content: "JOIN operations..." },
    { id: 4, title: "Advanced SQL", locked: true, content: "Subqueries, indexes..." }
];

const lessonList = document.getElementById('lessonList');
const content = document.getElementById('content');

// ===== Render Lessons =====
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

        // Lock premium lessons if user hasn't paid
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

// ===== Load Lesson Content =====
function loadLesson(id) {
    const user = getUser();
    const lesson = lessons.find(l => l.id === id);

    if (!lesson) {
        content.innerHTML = '<p>Lesson not found</p>';
        return;
    }

    // Locked lesson
    if (lesson.locked && (!user || !user.is_paid)) {
        content.innerHTML = `
            <h2>🔒 Premium Content</h2>
            <p>This lesson requires payment to unlock.</p>
            <p><strong>${lesson.title}</strong> is available after payment.</p>
            <div id="paypal-button-container"></div>
        `;
        renderPayPalButton(() => updatePaymentStatus(true)); // Unlock after payment
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

    // Track progress
    if (user && !user.completedModules.includes(id)) {
        user.completedModules.push(id);
        saveUser(user);
        checkCertificate(user);
    }
}

// ===== Previous / Next Navigation =====
function previousLesson(currentId) {
    const prev = lessons.find(l => l.id === currentId - 1);
    if (prev) loadLesson(prev.id);
}

function nextLesson(currentId) {
    const next = lessons.find(l => l.id === currentId + 1);
    if (next) loadLesson(next.id);
}

// ===== Certificate =====
function checkCertificate(user) {
    const completedCount = user.completedModules.length;
    const totalLessons = lessons.length;
    const allUnlocked = lessons.every(lesson => !lesson.locked || user.is_paid);

    if (completedCount === totalLessons && allUnlocked) {
        const div = document.createElement('div');
        div.innerHTML = `
            <div style="margin-top:20px;padding:20px;background:#e8f5e9;border-radius:8px;">
                <h3>🎓 Congratulations ${user.email}!</h3>
                <p>You have completed all ${totalLessons} lessons!</p>
                <button onclick="downloadCertificate()">📜 Download Certificate</button>
            </div>
        `;
        content.appendChild(div);
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

// ===== Login / Logout Buttons =====
document.getElementById('loginBtn').onclick = async () => {
    await login();
    renderLessons();
};

document.getElementById('logoutBtn').onclick = logout;

// ===== Listen for Firebase Auth Changes =====
onUserChanged((user) => {
    renderLessons();
});

// ===== Listen for Payment Updates =====
window.addEventListener('paymentUpdated', () => renderLessons());

// ===== Initialize =====
renderLessons();
