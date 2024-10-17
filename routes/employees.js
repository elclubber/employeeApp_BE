const express = require('express');
const router = express.Router();

// Temporary in-memory storage for employees
let employees = [
    { id: 1, name: 'John Doe', email: 'john@example.com', position: 'Manager' },
];

// Get all employees
router.get('/employeeList', (req, res) => {
    res.status(200).json(employees);
});

// Add a new employee
router.post('/addEmployee', (req, res) => {
    const { name, email, position } = req.body;
    const newEmployee = { id: employees.length + 1, name, email, position };
    employees.push(newEmployee);
    res.status(201).json(newEmployee);
});

// Delete an employee by ID
router.delete('/deleteEmployee/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    employees = employees.filter(employee => employee.id !== id);
    res.status(200).json({ message: 'Employee deleted' });
});

// Update an employee by ID
router.put('/updateEmployee/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, email, position } = req.body;

    const employee = employees.find(emp => emp.id === id);
    if (employee) {
        employee.name = name;
        employee.email = email;
        employee.position = position;
        return res.status(200).json(employee);
    }

    res.status(404).json({ message: 'Employee not found' });
});

module.exports = router;
