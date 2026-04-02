// app.js
import { getUser, login, logout, saveUser, updatePaymentStatus, onUserChanged } from './auth.js';
import { renderPayPalButton } from './payment.js';

const lessons = [
    { id: 1, title: "SQL Basics", locked: false, content: "Introduction to SQL..." },
    { id: 2, title: "Filtering Data", locked: false, content: "WHERE clause..." },
    { id: 3, title: "Sorting & Joins", locked: true, content: "JOIN operations..." },
    { id: 4, title: "Advanced SQL", locked: true, content: "Subqueries, indexes..." }
];

const lessonList = document.getElementById('lessonList');
const content = document.getElementById('content');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Listen to Firebase auth changes
onUserChanged(user => {
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
    renderLessons();
});

// Event listeners
loginBtn.onclick = async () => await login();
logoutBtn.onclick = async () => await logout();

function renderLessons() {
    const user = getUser();
    lessonList.innerHTML = '';
    
    lessons.forEach(lesson => {
        const li = document.createElement('li');
        li.textContent = lesson.title;

        if (lesson.locked && (!user || !user.is_paid)) {
            li.classList.add('locked');
            li.innerHTML += ' 🔒';
        } else if (user && user.completedModules.includes(lesson.id)) {
            li.classList.add('completed');
        }

        li.onclick = () => loadLesson(lesson.id);
        lessonList.appendChild(li);
    });

    updateProgressBar();
}

function loadLesson(id) {
    const user = getUser();
    const lesson = lessons.find(l => l.id === id);

    if (!lesson) {
        content.innerHTML = '<p>Lesson not found</p>';
        return;
    }

    if (lesson.locked && (!user || !user.is_paid)) {
        content.innerHTML = `
            <h2>🔒 Premium Content</h2>
            <p>This lesson requires payment to unlock.</p>
            <div id="paypal-button-container"></div>
        `;
        renderPayPalButton(async () => {
            await updatePaymentStatus(true);
            loadLesson(id);
        });
        return;
    }

    content.innerHTML = `
        <h2>${lesson.title}</h2>
        <p>${lesson.content}</p>
        <div class="lesson-navigation">
            <button onclick="previousLesson(${id})" class="btn-primary">Previous</button>
            <button onclick="nextLesson(${id})" class="btn-primary">Next</button>
        </div>
    `;

    if (user && !user.completedModules.includes(id)) {
        user.completedModules.push(id);
        saveUser(user);
        checkCertificate(user);
    }

    updateProgressBar();
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
    if (user.completedModules.length === lessons.length && user.is_paid) {
        const certDiv = document.createElement('div');
        certDiv.innerHTML = `
            <div style="margin-top: 20px; padding: 20px; background: #e8f5e9; border-radius: 8px;">
                <h3>🎓 Congratulations ${user.email}!</h3>
                <p>You completed all lessons!</p>
                <button onclick="downloadCertificate()">📜 Download Certificate</button>
            </div>
        `;
        content.appendChild(certDiv);
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
}

function updateProgressBar() {
    const user = getUser();
    if (!user) {
        progressFill.style.width = '0%';
        progressText.textContent = '0% complete';
        return;
    }

    const completed = user.completedModules.length;
    const total = lessons.length;
    const percent = Math.round((completed / total) * 100);

    progressFill.style.width = percent + '%';
    progressText.textContent = percent + '% complete';
}

// Initialize
renderLessons();
