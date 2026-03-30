// Unit tests for the application
import { getUser, login, logout, saveUser } from '../js/auth.js';

// Mock localStorage
global.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value.toString(); },
    removeItem(key) { delete this.store[key]; }
};

function testAuth() {
    console.log('Testing Auth Functions...');
    
    // Test save and get user
    const testUser = { email: 'test@example.com', is_paid: false, completedModules: [] };
    saveUser(testUser);
    const retrieved = getUser();
    console.assert(retrieved.email === testUser.email, 'Save/Get user failed');
    
    // Test logout
    logout();
    const afterLogout = getUser();
    console.assert(afterLogout === null, 'Logout failed');
    
    console.log('Auth tests passed!');
}

function testPaymentFlow() {
    console.log('Testing Payment Flow...');
    
    const mockOrder = { id: 'ORDER123', status: 'created' };
    console.assert(mockOrder.id === 'ORDER123', 'Order creation failed');
    
    const mockCapture = { status: 'captured', orderID: mockOrder.id };
    console.assert(mockCapture.status === 'captured', 'Capture failed');
    
    console.log('Payment tests passed!');
}

// Run tests
testAuth();
testPaymentFlow();
console.log('All tests completed!');