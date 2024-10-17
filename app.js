// Load environment variables from .env file
require('dotenv').config();

// Core modules
const path = require('path');

// Third-party modules
const express = require('express');
const cors = require('cors');

// Local modules
const rootDir = require('./utils/path');
const employeeRoutes = require('./routes/employees');
const authRoutes = require('./routes/auth');

// Create Express app
const app = express();

// CORS configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL,  // Use .env variable for frontend origin
        credentials: true,                 // Allow cookies/auth headers
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Set port from environment variables or default to 8080
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(rootDir, 'public')));

// Routes
app.use('/api', employeeRoutes);
app.use('/auth', authRoutes);

// 404 Page
app.use((req, res) => {
    res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
