// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ======= Firebase Config =======
// IMPORTANT: Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // Replace with actual API key
  authDomain: "sdwjr-site.firebaseapp.com",
  projectId: "sdwjr-site",
  storageBucket: "sdwjr-site.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",  // Replace with actual sender ID
  appId: "YOUR_APP_ID"                  // Replace with actual app ID
};

// Validate Firebase config before initialization
const isValidConfig = () => {
    const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missing = required.filter(key => !firebaseConfig[key] || firebaseConfig[key] === `YOUR_${key.toUpperCase()}`);
    
    if (missing.length > 0) {
        console.error('❌ Firebase config missing:', missing);
        return false;
    }
    return true;
};

// ======= Initialize Firebase =======
let app, auth, db, provider;

try {
    if (!isValidConfig()) {
        throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
    }
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
    
    // Add custom parameters for better UX
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    // Create fallback mock for development/testing
    if (window.location.hostname === 'localhost') {
        console.warn('⚠️ Running in development mode with mock auth');
    }
}

// ======= Helper: Save user locally =======
function saveToLocalStorage(user) {
    if (!user) {
        localStorage.removeItem('sql_user');
        return;
    }
    localStorage.setItem('sql_user', JSON.stringify(user));
}

// ======= Helper: Get user from localStorage =======
export function getUser() {
    try {
        const userData = localStorage.getItem('sql_user');
        if (!userData) return null;
        
        const user = JSON.parse(userData);
        
        // Ensure user has required properties
        if (!user.completedModules) user.completedModules = [];
        if (typeof user.is_paid === 'undefined') user.is_paid = false;
        
        return user;
    } catch (error) {
        console.error('Failed to get user from localStorage:', error);
        return null;
    }
}

// ======= Save user to both localStorage and Firestore =======
export async function saveUser(user) {
    if (!user || !user.uid) {
        console.error('❌ Invalid user data for saveUser');
        return false;
    }
    
    try {
        // Ensure user has all required fields
        const userData = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            is_paid: user.is_paid || false,
            completedModules: user.completedModules || [],
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Save to localStorage
        saveToLocalStorage(userData);
        
        // Save to Firestore with merge option
        if (db) {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, userData, { merge: true });
            console.log('✅ User saved to Firestore:', user.uid);
        }
        
        return true;
    } catch (error) {
        console.error('Failed to save user:', error);
        return false;
    }
}

// ======= Login with Google =======
export async function login() {
    if (!auth || !provider) {
        console.error('❌ Firebase auth not initialized');
        alert('Payment system is initializing. Please try again in a moment.');
        return null;
    }
    
    try {
        // Show loading indicator
        const loadingEvent = new CustomEvent('loading', { detail: { show: true, message: 'Signing in...' } });
        window.dispatchEvent(loadingEvent);
        
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;
        
        // Check if user exists in Firestore
        let userData;
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            // User exists, retrieve existing data
            userData = userDoc.data();
            userData.last_login = new Date().toISOString();
        } else {
            // New user, create default data
            userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                is_paid: false,
                completedModules: [],
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            };
        }
        
        // Save to localStorage
        saveToLocalStorage(userData);
        
        // Save/update Firestore
        await setDoc(userRef, userData, { merge: true });
        
        // Dispatch events
        window.dispatchEvent(new CustomEvent('userLogin', { detail: userData }));
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user: userData, type: 'login' } }));
        
        // Hide loading indicator
        window.dispatchEvent(new CustomEvent('loading', { detail: { show: false } }));
        
        console.log('✅ User logged in:', userData.email);
        return userData;
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        // Hide loading indicator
        window.dispatchEvent(new CustomEvent('loading', { detail: { show: false } }));
        
        // User-friendly error messages
        let errorMessage = 'Login failed. Please try again.';
        if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup was blocked. Please allow popups for this site.';
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Login cancelled. Please try again.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection.';
        }
        
        alert(errorMessage);
        return null;
    }
}

// ======= Logout =======
export async function logout() {
    if (!auth) {
        console.error('❌ Firebase auth not initialized');
        return false;
    }
    
    try {
        await signOut(auth);
        localStorage.removeItem('sql_user');
        
        // Dispatch events
        window.dispatchEvent(new CustomEvent('userLogout'));
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user: null, type: 'logout' }));
        
        console.log('✅ User logged out');
        return true;
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Logout failed. Please try again.');
        return false;
    }
}

// ======= Update payment status =======
export async function updatePaymentStatus(isPaid) {
    const user = getUser();
    
    if (!user || !user.uid) {
        console.error('❌ Cannot update payment status: No user logged in');
        throw new Error('No user logged in');
    }
    
    try {
        // Update local user
        user.is_paid = isPaid;
        user.payment_updated_at = new Date().toISOString();
        
        // Save to localStorage
        saveToLocalStorage(user);
        
        // Update Firestore
        if (db) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                is_paid: isPaid,
                payment_updated_at: new Date().toISOString()
            });
            console.log(`✅ Payment status updated to ${isPaid} for user:`, user.uid);
        }
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('paymentUpdated', { detail: { isPaid } }));
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user, type: 'payment' } }));
        
        return true;
        
    } catch (error) {
        console.error('❌ Failed to update payment status:', error);
        
        // Try to recover by re-saving entire user
        try {
            await saveUser(user);
            console.log('✅ Recovered: User data resaved');
        } catch (recoveryError) {
            console.error('❌ Recovery failed:', recoveryError);
        }
        
        return false;
    }
}

// ======= Listen to Firebase auth changes =======
export function onUserChanged(callback) {
    if (!auth) {
        console.error('❌ Firebase auth not initialized');
        callback(null);
        return () => {};
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
            if (firebaseUser) {
                // User is signed in
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    saveToLocalStorage(userData);
                    callback(userData);
                } else {
                    // User exists in Auth but not in Firestore
                    const newUserData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        is_paid: false,
                        completedModules: [],
                        created_at: new Date().toISOString(),
                        last_login: new Date().toISOString()
                    };
                    
                    await setDoc(userRef, newUserData);
                    saveToLocalStorage(newUserData);
                    callback(newUserData);
                }
            } else {
                // User is signed out
                localStorage.removeItem('sql_user');
                callback(null);
            }
        } catch (error) {
            console.error('❌ onUserChanged error:', error);
            callback(null);
        }
    });
    
    // Return unsubscribe function
    return unsubscribe;
}

// ======= Sync local user with Firestore =======
export async function syncUserWithFirestore() {
    const localUser = getUser();
    if (!localUser || !localUser.uid || !db) return null;
    
    try {
        const userRef = doc(db, 'users', localUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const firestoreUser = userDoc.data();
            // Merge local and Firestore data (Firestore takes precedence for payment status)
            const mergedUser = {
                ...localUser,
                ...firestoreUser,
                uid: localUser.uid
            };
            saveToLocalStorage(mergedUser);
            return mergedUser;
        }
        
        return localUser;
    } catch (error) {
        console.error('❌ Failed to sync user:', error);
        return localUser;
    }
}

// ======= Export initialized instances for debugging =======
export { auth, db };
