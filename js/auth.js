export function saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

export function getUser() {
    return JSON.parse(localStorage.getItem("user"));
}

export function login() {
    const email = prompt("Enter your email:");
    const user = { email, is_paid: false, completedModules: [] };
    saveUser(user);
    return user;
}

export function logout() {
    localStorage.removeItem("user");
    location.reload();