/**
 * Author: Teresa Fares
 * Date: 21 July 2025
 * Purpose: Handles login and registration form toggling, client-side validation,
 *          and communication with backend API endpoints for user authentication.
 */

// Select main container element to toggle active class for form switching
const container = document.querySelector('.container');

// Select buttons for switching between login and registration forms
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// When "Register" button clicked, show registration form by adding 'active' class
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

// When "Login" button clicked, show login form by removing 'active' class
loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Helper function to safely parse JSON from fetch response,
// logs raw text for debugging and throws error if JSON invalid
async function safeParseJSON(response) {
    const text = await response.text();
    console.log('Raw response text:', text);  // Debug log
    try {
        return JSON.parse(text);
    } catch {
        throw new Error("Server returned invalid JSON");
    }
}

// Handle login form submission
const loginForm = document.querySelector('.form-box.login form');
loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission behavior

    // Get trimmed username and password values from the form inputs
    const username = loginForm.querySelector('input[placeholder="Username"]').value.trim();
    const password = loginForm.querySelector('input[placeholder="Password"]').value;

    console.log('Attempting login with:', username); // Debug log

    // Send POST request to /login endpoint with JSON payload
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(async res => {
            // Safely parse JSON response, throw error if invalid or status not OK
            const data = await safeParseJSON(res);
            if (!res.ok) throw new Error(data.message || "Login failed");
            return data;
        })
        .then(data => {
            alert(data.message); // Show success or failure message to user
            if (data.success) {
                // Redirect to users page on successful login
                window.location.href = '/users.html';
            }
        })
        .catch(err => {
            // Show error alert if request or parsing failed
            alert("Login error: " + err.message);
        });
});

// Handle registration form submission
const registerForm = document.getElementById('registerForm');
const regPassword = document.getElementById('regPassword');
const signupError = document.getElementById('signupError');

registerForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission
    signupError.textContent = ''; // Clear previous error messages

    // Get trimmed username and password values from registration form
    const username = registerForm.querySelector('input[placeholder="Username"]').value.trim();
    const password = regPassword.value;

    console.log('Attempting registration with:', username); // Debug log

    // Simple client-side validation for password length
    if (password.length < 10) {
        signupError.textContent = "Password must be at least 10 characters long.";
        return; // Prevent submission if password too short
    }

    // Send POST request to /register endpoint with username and password JSON
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(async res => {
            // Safely parse JSON response and throw error if response not ok
            const data = await safeParseJSON(res);
            if (!res.ok) throw new Error(data.message || "Registration failed");
            return data;
        })
        .then(data => {
            alert(data.message); // Display success or failure message
            if (data.success) {
                registerForm.reset();         // Reset form fields on success
                container.classList.remove('active'); // Switch back to login form
            }
        })
        .catch(err => {
            // Show error message below registration form if error occurs
            signupError.textContent = err.message;
        });
});
