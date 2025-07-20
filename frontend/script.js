const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Debug helper: log raw response text before JSON parse
async function safeParseJSON(response) {
    const text = await response.text();
    console.log('Raw response text:', text);  // <--- Debug log
    try {
        return JSON.parse(text);
    } catch {
        throw new Error("Server returned invalid JSON");
    }
}

// Login form submit with backend call
const loginForm = document.querySelector('.form-box.login form');
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = loginForm.querySelector('input[placeholder="Username"]').value.trim();
    const password = loginForm.querySelector('input[placeholder="Password"]').value;

    console.log('Attempting login with:', username); // Debug log

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(async res => {
            const data = await safeParseJSON(res);
            if (!res.ok) throw new Error(data.message || "Login failed");
            return data;
        })
        .then(data => {
            alert(data.message);
            if (data.success) {
                // Redirect to users page after successful login
                window.location.href = '/users.html';
            }

        })
        .catch(err => {
            alert("Login error: " + err.message);
        });
});

// Registration form submit with validation and backend call
const registerForm = document.getElementById('registerForm');
const regPassword = document.getElementById('regPassword');
const signupError = document.getElementById('signupError');

registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    signupError.textContent = '';

    const username = registerForm.querySelector('input[placeholder="Username"]').value.trim();
    const password = regPassword.value;

    console.log('Attempting registration with:', username); // Debug log

    if (password.length < 10) {
        signupError.textContent = "Password must be at least 10 characters long.";
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(async res => {
            const data = await safeParseJSON(res);
            if (!res.ok) throw new Error(data.message || "Registration failed");
            return data;
        })
        .then(data => {
            alert(data.message);
            if (data.success) {
                registerForm.reset();
                container.classList.remove('active'); // switch to login
            }
        })
        .catch(err => {
            signupError.textContent = err.message;
        });
});
