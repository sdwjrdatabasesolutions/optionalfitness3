// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ======= Firebase Config =======
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "sdwjr-site.firebaseapp.com",
  projectId: "sdwjr-site",
  storageBucket: "sdwjr-site.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ======= Initialize Firebase =======
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ======= Save user locally + Firestore =======
export async function saveUser(user) {
    if (!user || !user.uid) {
        console.error('Invalid user data');
        return false;
    }
    try {
        localStorage.setItem("user", JSON.stringify(user));
        await setDoc(doc(db, "users", user.uid), user, { merge: true });
        return true;
    } catch (error) {
        console.error('Failed to save user:', error);
        return false;
    }
}

// ======= Get user from localStorage =======
export function getUser() {
    try {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Failed to get user:', error);
        return null;
    }
}

// ======= Login with Firebase =======
export async function login() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userData = {
            uid: user.uid,
            email: user.email,
            is_paid: false,
            completedModules: []
        };

        // Save to Firestore + localStorage
        await saveUser(userData);

        // Dispatch event so app.js can re-render lessons
        window.dispatchEvent(new Event('userLogin'));

        return userData;

    } catch (error) {
        console.error("Login error:", error);
        return null;
    }
}

// ======= Logout =======
export async function logout() {
    await signOut(auth);
    localStorage.removeItem("user");
    window.dispatchEvent(new Event('userLogout'));
    location.reload();
}

// ======= Update payment status =======
export async function updatePaymentStatus(isPaid) {
    const user = getUser();
    if (user) {
        user.is_paid = isPaid;
        await saveUser(user);
        window.dispatchEvent(new Event('paymentUpdated'));
    }
}

// ======= Optional: Listen to Firebase auth changes =======
export function onUserChanged(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            const userData = docSnap.exists() ? docSnap.data() : null;
            if (userData) {
                localStorage.setItem("user", JSON.stringify(userData));
                callback(userData);
            }
        } else {
            localStorage.removeItem("user");
            callback(null);
        }
    });
}
