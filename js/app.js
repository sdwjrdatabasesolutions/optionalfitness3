// app.js
import { getUser, saveUser, updatePaymentStatus } from './auth.js';
import { renderPayPalButton } from './payment.js';

const lessons = [
    { id: 1, title: "SQL Basics", locked: false, content: "Introduction to SQL..." },
    { id: 2, title: "Filtering Data", locked: false, content: "WHERE clause..." },
    { id: 3, title: "Sorting & Joins", locked: true, content: "JOIN operations..." },
    { id: 4, title: "Advanced SQL", locked: true, content: "Subqueries, indexes..." }
];

const lessonList = document.getElementById('lessonList');
const content = document.getElementById('content');

let currentUser = null;

// ----------------------------
// Firebase login
// ----------------------------
async function login() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(firebase.auth(), provider);
        const user = {
            email: result.user.email,
            is_paid: false,
            completedModules: [],
            uid: result.user.uid
        };
        saveUser(user);
        currentUser = user;
        await syncProgress(); // load progress from backend
        renderLessons();
    } catch (err) {
        console.error('Login failed', err);
    }
}

async function logoutUser() {
    await firebase.auth().signOut();
    currentUser = null;
    localStorage.removeItem('user');
    location.reload();
}

// ----------------------------
// Backend API calls
// ----------------------------
async function syncProgress() {
    if (!currentUser) return;
    try {
        const res = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await firebase.auth().currentUser.getIdToken()}`
            },
            body: JSON.stringify({ queryType: 'getUserProgress' })
        });
        const data = await res.json();
        if (data.completed_modules) currentUser.completedModules = data.completed_modules;
        if (data.is_paid) currentUser.is_paid = data.is_paid;
        saveUser(currentUser);
    } catch (err) {
        console.error('Failed to sync progress', err);
    }
}

async function saveProgress() {
    if (!currentUser) return;
    try {
        await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await firebase.auth().currentUser.getIdToken()}`
            },
            body: JSON.stringify({
                queryType: 'updateProgress',
                completedModules: currentUser.completedModules,
                isPaid: currentUser.is_paid
            })
        });
    } catch (err) {
        console.error('Failed to save progress', err);
    }
}

// ----------------------------
// Lessons rendering
// ----------------------------
function renderLessons() {
    const user = currentUser || getUser();
    lessonList.innerHTML = '';

    lessons.forEach(lesson => {
        const li = document.createElement('li');
        li.textContent = lesson.title;
        li.style.cursor = 'pointer';
        li.style.padding = '8px';
        li.style.margin = '4px 0';
        li.style.backgroundColor = '#f0f0f0';
        li.style.borderRadius = '4px';

        if (lesson.locked && (!user || !user.is_paid)) {
            li.style.opacity = '0.6';
            li.innerHTML += ' 🔒';
        } else {
            li.style.backgroundColor = '#e0e0e0';
        }

        li.onclick = () => loadLesson(lesson.id);
        lessonList.appendChild(li);
    });
}

function loadLesson(id) {
    const user = currentUser || getUser();
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
        renderPayPalButton(() => {
            // Payment callback
            updatePaymentStatus(true);
            if (currentUser) currentUser.is_paid = true;
            saveProgress();
            renderLessons();
            loadLesson(id);
        });
        return;
    }

    content.innerHTML = `
        <h2>${lesson.title}</h2>
        <p>${lesson.content}</p>
        <div class="lesson-navigation">
            <button onclick="previousLesson(${id})">Previous</button>
            <button onclick="nextLesson(${id})">Next</button>
        </div>
    `;

    if (user && !user.completedModules.includes(id)) {
        user.completedModules.push(id);
        saveProgress();
        renderLessons();
        checkCertificate(user);
    }
}

// ----------------------------
// Navigation
// ----------------------------
window.previousLesson = function(currentId) {
    const prevLesson = lessons.find(l => l.id === currentId - 1);
    if (prevLesson) loadLesson(prevLesson.id);
};

window.nextLesson = function(currentId) {
    const nextLesson = lessons.find(l => l.id === currentId + 1);
    if (nextLesson) loadLesson(nextLesson.id);
};

// ----------------------------
// Certificate
// ----------------------------
function checkCertificate(user) {
    const completedCount = user.completedModules.length;
    const totalLessons = lessons.length;
    const allUnlocked = lessons.every(l => !l.locked || user.is_paid);

    if (completedCount === totalLessons && allUnlocked) {
        const certificateDiv = document.createElement('div');
        certificateDiv.innerHTML = `
            <div style="margin-top:20px;padding:20px;background:#e8f5e9;border-radius:8px;">
                <h3>🎓 Congratulations ${user.email}!</h3>
                <p>You have completed all ${totalLessons} lessons!</p>
                <button onclick="downloadCertificate()">📜 Download Certificate</button>
            </div>
        `;
        content.appendChild(certificateDiv);
    }
}

window.downloadCertificate = function() {
    const user = currentUser || getUser();
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

// ----------------------------
// Event Listeners
// ----------------------------
document.getElementById('loginBtn').onclick = login;
document.getElementById('logoutBtn').onclick = logoutUser;

// ----------------------------
// Init
// ----------------------------
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = getUser() || { email: user.email, uid: user.uid, is_paid: false, completedModules: [] };
        syncProgress().then(renderLessons);
    } else {
        currentUser = null;
        renderLessons();
    }
});
