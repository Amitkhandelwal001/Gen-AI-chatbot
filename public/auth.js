const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const alertBox = document.getElementById('auth-alert');

// Check if already logged in
if (localStorage.getItem('personaToken')) {
    window.location.href = 'index.html';
}

function showAlert(msg, isError) {
    alertBox.style.display = 'block';
    alertBox.textContent = msg;
    alertBox.style.color = isError ? '#ef4444' : '#10b981';
    alertBox.style.background = isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)';
    alertBox.style.border = `1px solid ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`;
}

showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    alertBox.style.display = 'none';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    alertBox.style.display = 'none';
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('personaToken', data.token);
            window.location.href = 'index.html';
        } else {
            showAlert(data.message || 'Login failed', true);
        }
    } catch (err) {
        showAlert('Server connection error', true);
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    try {
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            showAlert('Account created! Please sign in.', false);
            signupForm.reset();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
        } else {
            showAlert(data.message || 'Signup failed', true);
        }
    } catch (err) {
        showAlert('Server connection error', true);
    }
});
