// test.js
// Unit tests for authentication, payment, and progress logic

import { getUser, login, logout, saveUser, updatePaymentStatus } from '../js/auth.js';

// Mock localStorage for testing
global.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value.toString(); },
    removeItem(key) { delete this.store[key]; }
};

// -----------------------------
// Auth Tests
// -----------------------------
function testAuth() {
    console.log('Testing Auth Functions...');

    // Test saveUser and getUser
    const testUser = { email: 'test@example.com', is_paid: false, completedModules: [] };
    saveUser(testUser);
    const retrieved = getUser();
    console.assert(retrieved.email === testUser.email, '❌ Save/Get user failed');

    // Test logout
    logout();
    const afterLogout = getUser();
    console.assert(afterLogout === null, '❌ Logout failed');

    // Test login (mock prompt)
    const mockEmail = 'login@test.com';
    global.prompt = () => mockEmail; // Mock prompt
    const loggedInUser = login();
    console.assert(loggedInUser.email === mockEmail, '❌ Login failed');
    console.assert(getUser().email === mockEmail, '❌ Login not saved to localStorage');

    console.log('✅ Auth tests passed!\n');
}

// -----------------------------
// Payment Tests
// -----------------------------
function testPaymentFlow() {
    console.log('Testing Payment Flow...');

    const user = { email: 'pay@test.com', is_paid: false, completedModules: [] };
    saveUser(user);

    // Update payment status
    updatePaymentStatus(true);
    const updatedUser = getUser();
    console.assert(updatedUser.is_paid === true, '❌ Payment status update failed');

    console.log('✅ Payment tests passed!\n');
}

// -----------------------------
// Lesson Progress Tests
// -----------------------------
function testProgress() {
    console.log('Testing Lesson Progress...');

    const user = { email: 'progress@test.com', is_paid: true, completedModules: [] };
    saveUser(user);

    // Simulate completing lessons
    const userData = getUser();
    userData.completedModules.push(1);
    userData.completedModules.push(2);
    saveUser(userData);

    const savedUser = getUser();
    console.assert(Array.isArray(savedUser.completedModules), '❌ completedModules is not an array');
    console.assert(savedUser.completedModules.length === 2, '❌ completedModules length incorrect');
    console.assert(savedUser.completedModules.includes(1) && savedUser.completedModules.includes(2), '❌ Modules not saved correctly');

    console.log('✅ Lesson progress tests passed!\n');
}

// -----------------------------
// Run All Tests
// -----------------------------
function runTests() {
    testAuth();
    testPaymentFlow();
    testProgress();
    console.log('🎉 All tests completed successfully!');
}

runTests();
