// test.js
// Unit tests for authentication, payment, and progress logic

import { getUser, login, logout, saveUser, updatePaymentStatus, onUserChanged } from '../js/auth.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'; // Using Vitest for modern testing

// Mock Firebase and external dependencies
vi.mock('firebase/app', () => ({
    initializeApp: vi.fn()
}));

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({
        signInWithPopup: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChanged: vi.fn()
    })),
    GoogleAuthProvider: vi.fn()
}));

// Mock localStorage for testing
const localStorageMock = {
    store: {},
    getItem(key) { 
        return this.store[key] || null; 
    },
    setItem(key, value) { 
        this.store[key] = value.toString(); 
    },
    removeItem(key) { 
        delete this.store[key]; 
    },
    clear() {
        this.store = {};
    }
};

global.localStorage = localStorageMock;

// Mock sessionStorage if needed
global.sessionStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = value.toString(); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
};

// Mock prompt for login tests
const originalPrompt = global.prompt;

// Helper function to clear all test data
function clearTestData() {
    localStorage.clear();
    sessionStorage.clear();
}

// Helper to create mock user
function createMockUser(email = 'test@example.com', isPaid = false, completedModules = []) {
    return {
        email,
        uid: `uid_${Date.now()}_${Math.random()}`,
        is_paid: isPaid,
        completedModules: [...completedModules],
        last_login: new Date().toISOString()
    };
}

// -----------------------------
// Auth Tests
// -----------------------------
describe('Authentication Tests', () => {
    beforeEach(() => {
        clearTestData();
        vi.clearAllMocks();
    });
    
    afterEach(() => {
        global.prompt = originalPrompt;
    });

    it('should save and retrieve user correctly', () => {
        const testUser = createMockUser('test@example.com', false, []);
        saveUser(testUser);
        
        const retrieved = getUser();
        
        expect(retrieved).toBeDefined();
        expect(retrieved.email).toBe(testUser.email);
        expect(retrieved.completedModules).toEqual([]);
        expect(retrieved.is_paid).toBe(false);
    });
    
    it('should return null after logout', () => {
        const testUser = createMockUser('logout@test.com');
        saveUser(testUser);
        
        logout();
        
        const afterLogout = getUser();
        expect(afterLogout).toBeNull();
    });
    
    it('should handle login with valid email', async () => {
        const mockEmail = 'login@test.com';
        global.prompt = vi.fn(() => mockEmail);
        
        const loggedInUser = await login();
        
        expect(loggedInUser).toBeDefined();
        expect(loggedInUser.email).toBe(mockEmail);
        
        const savedUser = getUser();
        expect(savedUser.email).toBe(mockEmail);
    });
    
    it('should handle login cancellation', async () => {
        global.prompt = vi.fn(() => null);
        
        const loggedInUser = await login();
        
        expect(loggedInUser).toBeNull();
        expect(getUser()).toBeNull();
    });
    
    it('should handle invalid email format', async () => {
        global.prompt = vi.fn(() => 'invalid-email');
        
        const loggedInUser = await login();
        
        // Should reject invalid email format
        expect(loggedInUser).toBeNull();
        expect(getUser()).toBeNull();
    });
    
    it('should trigger onUserChanged callback when user changes', async () => {
        const mockCallback = vi.fn();
        onUserChanged(mockCallback);
        
        const testUser = createMockUser('callback@test.com');
        saveUser(testUser);
        
        expect(mockCallback).toHaveBeenCalledWith(testUser);
        
        logout();
        
        expect(mockCallback).toHaveBeenCalledWith(null);
    });
    
    it('should preserve user data structure when saving', () => {
        const testUser = createMockUser('structure@test.com', true, [1, 2, 3]);
        saveUser(testUser);
        
        const retrieved = getUser();
        
        expect(retrieved).toMatchObject({
            email: 'structure@test.com',
            is_paid: true,
            completedModules: [1, 2, 3]
        });
        expect(retrieved.uid).toBeDefined();
        expect(retrieved.last_login).toBeDefined();
    });
});

// -----------------------------
// Payment Tests
// -----------------------------
describe('Payment Flow Tests', () => {
    beforeEach(() => {
        clearTestData();
    });
    
    it('should update payment status from false to true', async () => {
        const user = createMockUser('pay@test.com', false, []);
        saveUser(user);
        
        await updatePaymentStatus(true);
        
        const updatedUser = getUser();
        expect(updatedUser.is_paid).toBe(true);
    });
    
    it('should update payment status from true to false', async () => {
        const user = createMockUser('pay2@test.com', true, []);
        saveUser(user);
        
        await updatePaymentStatus(false);
        
        const updatedUser = getUser();
        expect(updatedUser.is_paid).toBe(false);
    });
    
    it('should handle payment update when no user exists', async () => {
        // No user saved
        await expect(updatePaymentStatus(true)).rejects.toThrow();
    });
    
    it('should preserve completed modules when updating payment', async () => {
        const user = createMockUser('preserve@test.com', false, [1, 2]);
        saveUser(user);
        
        await updatePaymentStatus(true);
        
        const updatedUser = getUser();
        expect(updatedUser.is_paid).toBe(true);
        expect(updatedUser.completedModules).toEqual([1, 2]);
    });
    
    it('should add payment timestamp when status changes', async () => {
        const user = createMockUser('timestamp@test.com', false, []);
        saveUser(user);
        
        const beforeUpdate = Date.now();
        await updatePaymentStatus(true);
        const afterUpdate = Date.now();
        
        const updatedUser = getUser();
        expect(updatedUser.payment_updated_at).toBeDefined();
        const paymentTime = new Date(updatedUser.payment_updated_at).getTime();
        expect(paymentTime).toBeGreaterThanOrEqual(beforeUpdate);
        expect(paymentTime).toBeLessThanOrEqual(afterUpdate);
    });
});

// -----------------------------
// Lesson Progress Tests
// -----------------------------
describe('Lesson Progress Tests', () => {
    beforeEach(() => {
        clearTestData();
    });
    
    it('should initialize with empty completed modules', () => {
        const user = createMockUser('progress@test.com', true, []);
        saveUser(user);
        
        const savedUser = getUser();
        expect(Array.isArray(savedUser.completedModules)).toBe(true);
        expect(savedUser.completedModules.length).toBe(0);
    });
    
    it('should add lessons to completed modules', () => {
        const user = createMockUser('progress@test.com', true, []);
        saveUser(user);
        
        const userData = getUser();
        userData.completedModules.push(1);
        userData.completedModules.push(2);
        saveUser(userData);
        
        const savedUser = getUser();
        expect(savedUser.completedModules).toHaveLength(2);
        expect(savedUser.completedModules).toContain(1);
        expect(savedUser.completedModules).toContain(2);
    });
    
    it('should not add duplicate lesson IDs', () => {
        const user = createMockUser('dedupe@test.com', true, []);
        saveUser(user);
        
        const userData = getUser();
        userData.completedModules.push(1);
        userData.completedModules.push(1); // Duplicate
        saveUser(userData);
        
        const savedUser = getUser();
        // Should have only one instance of lesson 1
        const count = savedUser.completedModules.filter(id => id === 1).length;
        expect(count).toBe(1);
    });
    
    it('should handle multiple lesson completions in order', () => {
        const user = createMockUser('order@test.com', true, []);
        saveUser(user);
        
        const userData = getUser();
        userData.completedModules.push(1, 2, 3, 4);
        saveUser(userData);
        
        const savedUser = getUser();
        expect(savedUser.completedModules).toEqual([1, 2, 3, 4]);
    });
    
    it('should calculate progress percentage correctly', () => {
        const totalLessons = 4;
        const user = createMockUser('percent@test.com', true, [1, 2]);
        saveUser(user);
        
        const savedUser = getUser();
        const percentComplete = (savedUser.completedModules.length / totalLessons) * 100;
        
        expect(percentComplete).toBe(50);
    });
    
    it('should handle 100% completion', () => {
        const totalLessons = 4;
        const user = createMockUser('complete@test.com', true, [1, 2, 3, 4]);
        saveUser(user);
        
        const savedUser = getUser();
        expect(savedUser.completedModules.length).toBe(totalLessons);
    });
    
    it('should preserve progress after payment update', async () => {
        const user = createMockUser('preserve-progress@test.com', false, [1, 2]);
        saveUser(user);
        
        await updatePaymentStatus(true);
        
        const savedUser = getUser();
        expect(savedUser.completedModules).toEqual([1, 2]);
        expect(savedUser.is_paid).toBe(true);
    });
});

// -----------------------------
// Edge Cases and Error Handling
// -----------------------------
describe('Edge Cases', () => {
    beforeEach(() => {
        clearTestData();
    });
    
    it('should handle saving null user', () => {
        expect(() => saveUser(null)).toThrow();
    });
    
    it('should handle saving undefined user', () => {
        expect(() => saveUser(undefined)).toThrow();
    });
    
    it('should handle corrupted localStorage data', () => {
        localStorage.setItem('sql_user', 'invalid-json');
        
        const user = getUser();
        expect(user).toBeNull();
    });
    
    it('should handle missing completedModules array', () => {
        const invalidUser = { email: 'test@test.com', is_paid: true };
        saveUser(invalidUser);
        
        const savedUser = getUser();
        expect(savedUser.completedModules).toBeDefined();
        expect(Array.isArray(savedUser.completedModules)).toBe(true);
    });
    
    it('should handle concurrent updates gracefully', async () => {
        const user = createMockUser('concurrent@test.com', false, []);
        saveUser(user);
        
        // Simulate concurrent updates
        await Promise.all([
            updatePaymentStatus(true),
            updatePaymentStatus(false),
            updatePaymentStatus(true)
        ]);
        
        const finalUser = getUser();
        expect(finalUser.is_paid).toBe(true); // Last update wins
    });
});

// -----------------------------
// Run Tests
// -----------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🧪 Starting SQL Learning Platform Tests...\n');
    
    // Simple test runner if Vitest not available
    const runSimpleTests = async () => {
        let passed = 0;
        let failed = 0;
        
        // Run basic tests
        try {
            console.log('Testing Auth Functions...');
            const testUser = createMockUser('test@example.com', false, []);
            saveUser(testUser);
            const retrieved = getUser();
            if (retrieved.email === testUser.email) {
                console.log('  ✅ Save/Get user passed');
                passed++;
            } else {
                console.log('  ❌ Save/Get user failed');
                failed++;
            }
            
            logout();
            const afterLogout = getUser();
            if (afterLogout === null) {
                console.log('  ✅ Logout passed');
                passed++;
            } else {
                console.log('  ❌ Logout failed');
                failed++;
            }
            
            console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
            
            if (failed === 0) {
                console.log('🎉 All tests completed successfully!');
            } else {
                console.log('⚠️ Some tests failed. Please check the output above.');
            }
        } catch (error) {
            console.error('❌ Test suite error:', error);
        }
    };
    
    runSimpleTests();
}

// Export for use in test runners
export { createMockUser, clearTestData };
