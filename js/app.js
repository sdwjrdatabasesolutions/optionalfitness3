import { getUser, login, logout, saveUser } from './auth.js';
import { renderPayPalButton } from './payment.js';

const lessons = [
    { id: 1, title: "SQL Basics", locked: false },
    { id: 2, title: "Filtering Data", locked: false },
    { id: 3, title: "Sorting & Joins", locked: true },
    { id: 4, title: "Advanced SQL", locked: true }
];

const lessonList = document.getElementById('lessonList');
const content = document.getElementById('content');

function renderLessons() {
    lessonList.innerHTML = '';
    lessons.forEach(lesson => {
        const li = document.createElement('li');
        li.textContent = lesson.title;
        li.style.cursor = "pointer";
        li.onclick = () => loadLesson(lesson.id);
        lessonList.appendChild(li);
    });
}

function loadLesson(id) {
    const user = getUser();
    const lesson = lessons.find(l => l.id === id);

    if (lesson.locked && (!user || !user.is_paid)) {
        content.innerHTML = `<h2>🔒 Premium Content</h2>
        <p>This lesson requires payment to unlock.</p>
        <div id="paypal-button-container"></div>`;
        renderPayPalButton();
        return;
    }

    content.innerHTML = `<h2>${lesson.title}</h2>
        <p>Lesson content goes here...</p>`;

    if (user && !user.completedModules.includes(id)) {
        user.completedModules.push(id);
        saveUser(user);
        checkCertificate(user);
    }
}

function checkCertificate(user) {
    const allUnlocked = lessons.every(l => !l.locked || user.is_paid);
    if (user.completedModules.length === lessons.length && allUnlocked) {
        content.innerHTML += `<h3>🎓 Congratulations! You completed the course!</h3>
        <a href="#">Download Certificate</a>`;
    }
}

document.getElementById('loginBtn').onclick = () => { login(); renderLessons(); };
document.getElementById('logoutBtn').onclick = () => logout();

renderLessons();