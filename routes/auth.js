const express = require('express');
const router = express.Router();

// Login route to set auth cookie
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password') {
    // Set an authToken cookie
    res.cookie('authToken', 'some-token', {
      httpOnly: true,    // Cookie cannot be accessed via client-side JavaScript
      maxAge: 60 * 60 * 1000,  // 1 hour
      sameSite: 'lax',   // Allow cookies in same-origin requests
    });
    return res.status(200).json({ message: 'Login successful' });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

router.post('/logout', (req, res) => {
  // Clear the auth cookie
  res.clearCookie('authToken');
  res.status(200).json({ message: 'Logout successful' });
});

// Check auth route to validate cookie
router.get('/check-auth', (req, res) => {
  const authToken = req.cookies.authToken;

  if (authToken) {
    return res.status(200).json({ loggedIn: true });
  }

  res.status(401).json({ loggedIn: false });
});

module.exports = router;
