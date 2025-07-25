// Author: Teresa Fares
// Date: 21 July 2025
// Purpose: Simple Express server to handle user login, registration, 
//          and retrieval of registered users using a text file (accounts.txt)
//          to store credentials. Returns JSON responses for frontend consumption.

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const ACCOUNTS_FILE = path.join(__dirname, 'accounts.txt');

app.use(express.json());
app.use(express.static('frontend'));

// Login endpoint: checks username/password against accounts.txt
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log('Login attempt:', username);  // Debug log

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required." });
    }

    fs.readFile(ACCOUNTS_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // No accounts.txt file exists yet
                console.log('No accounts.txt found.');
                return res.status(401).json({ success: false, message: "Invalid credentials." });
            }
            console.error('Error reading accounts.txt:', err);
            return res.status(500).json({ success: false, message: "Server error." });
        }

        const lines = data.split('\n');
        let found = false;

        // Iterate over each line to find matching credentials
        for (let line of lines) {
            const [fileUser, filePass] = line.trim().split(',');
            if (fileUser === username && filePass === password) {
                found = true;
                break;
            }
        }

        if (found) {
            console.log('Login successful for:', username);
            res.json({ success: true, message: "Login successful!" });
        } else {
            console.log('Login failed for:', username);
            res.status(401).json({ success: false, message: "Invalid credentials." });
        }
    });
});

// Registration endpoint: validates and appends new user to accounts.txt
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    console.log('Register attempt:', username);  // Debug log

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    if (password.length < 10) {
        return res.status(400).json({ success: false, message: "Password must be at least 10 characters." });
    }

    fs.readFile(ACCOUNTS_FILE, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading accounts.txt:', err);
            return res.status(500).json({ success: false, message: "Server error reading accounts." });
        }

        const lines = data ? data.split('\n') : [];
        const users = lines.map(line => line.trim().split(',')[0]);

        // Check if username already exists
        if (users.includes(username)) {
            console.log('Registration failed, username taken:', username);
            return res.status(409).json({ success: false, message: "Username already taken." });
        }

        const newLine = `${username},${password}\n`;

        // Append new user credentials to the file
        fs.appendFile(ACCOUNTS_FILE, newLine, (err) => {
            if (err) {
                console.error('Error saving new account:', err);
                return res.status(500).json({ success: false, message: "Server error saving account." });
            }

            console.log('Registration successful for:', username);
            res.json({ success: true, message: "Registration successful!" });
        });
    });
});

// Endpoint to retrieve all registered usernames (no passwords sent)
app.get('/users', (req, res) => {
    fs.readFile(ACCOUNTS_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // No users registered yet, send empty list
                return res.json({ users: [] });
            }
            // Other errors: log and respond with empty users array to avoid frontend errors
            console.error('Error reading accounts file:', err);
            return res.json({ users: [] });
        }

        // Filter out empty lines and extract usernames only
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const users = lines.map(line => line.split(',')[0]);

        res.json({ users });
    });
});

// Test endpoint to view raw accounts.txt file contents (for debugging)
app.get('/testfile', (req, res) => {
    fs.readFile(ACCOUNTS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading file');
        res.send(`<pre>${data}</pre>`);
    });
});

// Catch-all 404 handler for unknown routes, returns JSON response
app.use((req, res) => {
    console.log('404 Not Found:', req.originalUrl);
    res.status(404).json({ success: false, message: "Endpoint not found" });
});

// Start server and listen on configured port
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
