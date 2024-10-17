const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Temporary hardcoded credentials for testing
    if (username === 'admin' && password === 'password') {
        return res.status(200).json({ message: 'Login successful' });
    }

    res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
