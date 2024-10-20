const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database connection
const db = new sqlite3.Database(path.resolve(__dirname, '../database/employee.db'), (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Initialize the employee table
db.run(
    `CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        position TEXT,
        age INTEGER,
        phone TEXT,
        department TEXT,
        joiningDate TEXT,
        employeeType TEXT,
        maritalStatus TEXT,
        salary REAL,
        image TEXT
    )`
);

// Helper function to add a column if it does not exist
const addColumnIfNotExists = (columnName, columnDefinition) => {
    db.all(`PRAGMA table_info(employees);`, [], (err, rows) => {
        if (err) {
            console.error(`Failed to retrieve table info: ${err.message}`);
            return;
        }

        const columnExists = rows.some((row) => row.name === columnName); // Use `some` to check if the column exists

        if (!columnExists) {
            db.run(
                `ALTER TABLE employees ADD COLUMN ${columnName} ${columnDefinition};`,
                (err) => {
                    if (err) {
                        console.error(`Failed to add column ${columnName}: ${err.message}`);
                    } else {
                        console.log(`Added column ${columnName}.`);
                    }
                }
            );
        }
    });
};

// Ensure all required columns exist
addColumnIfNotExists('phone', 'TEXT');
addColumnIfNotExists('address', 'TEXT');
addColumnIfNotExists('department', 'TEXT');
addColumnIfNotExists('joiningDate', 'TEXT');
addColumnIfNotExists('employeeType', 'TEXT');
addColumnIfNotExists('maritalStatus', 'TEXT');
addColumnIfNotExists('salary', 'REAL');

module.exports = db;
