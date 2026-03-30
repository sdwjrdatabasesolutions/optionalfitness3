export function saveUser(user) {
    if (!user || !user.email) {
        console.error('Invalid user data');
        return false;
    }
    try {
        localStorage.setItem("user", JSON.stringify(user));
        return true;
    } catch (error) {
        console.error('Failed to save user:', error);
        return false;
    }
}

export function getUser() {
    try {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Failed to get user:', error);
        return null;
    }
}

export function login() {
    const email = prompt("Enter your email:");
    
    // Validate email
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return null;
    }
    
    const user = { 
        email, 
        is_paid: false, 
        completedModules: [],
        userId: Date.now().toString() // Add unique ID
    };
    
    saveUser(user);
    return user;
}

export function logout() {
    localStorage.removeItem("user");
    // Dispatch event for other components
    window.dispatchEvent(new Event('userLogout'));
    location.reload();
}

export function updatePaymentStatus(isPaid) {
    const user = getUser();
    if (user) {
        user.is_paid = isPaid;
        saveUser(user);
        window.dispatchEvent(new Event('paymentUpdated'));
    }
}