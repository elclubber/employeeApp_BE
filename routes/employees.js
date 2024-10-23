const express = require('express');
const db = require('../utils/db'); // SQLite database connection
const upload = require('../utils/upload'); // Multer upload configuration
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Helper function to save a Base64 image to the file system
const saveBase64Image = (base64Data, filename) => {
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid Base64 string');
    }

    const buffer = Buffer.from(matches[2], 'base64'); // Decode Base64 to buffer
    const filePath = path.join(__dirname, '../uploads', filename);

    fs.writeFileSync(filePath, buffer); // Save the file
    return `/uploads/${filename}`; // Return the relative path for later use
};

// Get all employees
router.get('/employeeList', (req, res) => {
    const sql = `
        SELECT id, name, email, position, age, phone, address, department,
               joiningDate, salary, maritalStatus, employeeType, image
        FROM employees
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to fetch employees' });
        }

        const employeesWithImageUrls = rows.map((employee) => ({
            ...employee,
            image: employee.image
                ? `${req.protocol}://${req.get('host')}${employee.image}`
                : null,
        }));

        res.json(employeesWithImageUrls);
    });
});

// Add a new employee with an image upload
router.post('/addEmployee', upload.single('image'), (req, res) => {
    const {
        name, email, position, age, phone, address, department,
        joiningDate, salary, maritalStatus, employeeType, image
    } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required.' });
    }

    let imageUrl = null;
    if (image) {
        try {
            const filename = `${Date.now()}-employee.png`; // Generate a unique filename
            imageUrl = saveBase64Image(image, filename); // Save image and get URL
        } catch (error) {
            return res.status(500).json({ error: 'Failed to save image' });
        }
    }

    const sql = `
        INSERT INTO employees (
            name, email, position, age, phone, address, department,
            joiningDate, salary, maritalStatus, employeeType, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        name, email, position || null, parseInt(age) || null, phone || null,
        address || null, department || null, joiningDate || null,
        parseFloat(salary) || null, maritalStatus || null,
        employeeType || null, imageUrl
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error(err);
            return res.status(409).json({ error: 'Email already exists' });
        }
        // Format the response with the correct data types
        const responseEmployee = {
            id: this.lastID,
            name,
            email,
            position,
            age: parseInt(age) || null,  // Convert to number
            phone,
            address,
            department,
            joiningDate,
            salary: parseFloat(salary) || null,  // Convert to number
            maritalStatus,
            employeeType,
            image: imageUrl,
        };

        res.status(201).json(responseEmployee);
    });
});

// Delete an employee and remove the image from the server
router.delete('/deleteEmployee/:id', (req, res) => {
    const { id } = req.params;

    // Fetch the employee's image before deleting
    db.get('SELECT image FROM employees WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to fetch employee' });
        }

        if (row && row.image) {
            const filePath = path.join(__dirname, '..', row.image);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete image:', err.message);
                }
            });
        }

        db.run('DELETE FROM employees WHERE id = ?', [id], (err) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Failed to delete employee' });
            }
            res.status(200).json({ message: 'Employee deleted' });
        });
    });
});

// Update an employee with optional image update
router.put('/updateEmployee/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, email, position, age } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
        UPDATE employees
        SET name = ?, email = ?, position = ?, age = ?, image = COALESCE(?, image)
        WHERE id = ?
    `;
    const params = [name, email, position, parseInt(age), imageUrl, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to update employee' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee updated' });
    });
});

router.use('/deployTest', (req, res, next) => {
    const test = 'IT works';
    console.log(test, 'test');
    res.send(test);
});

module.exports = router;
