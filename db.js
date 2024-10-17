/**
 * This project includes code suggestions and assistance from ChatGPT 
 * to enhance certain functionalities and optimize code structure.
 */

const mysql = require('mysql2');

// Initial configuration for MySQL server connection (without database)
const serverConfig = {
    user: 'root',
    password: '',
    host: '127.0.0.1',
    port: 3306
};

// Configuration with the database once it exists
let dbConnection;  // Define dbConnection globally

// Function to create the lab5 database if it doesn't exist
const createDatabaseIfNotExists = () => {
    const serverConnection = mysql.createConnection(serverConfig);
    return new Promise((resolve, reject) => {
        serverConnection.query('CREATE DATABASE IF NOT EXISTS lab5;', (err, result) => {
            if (err) {
                reject(err);
            } else {
                console.log('Database lab5 checked/created.');
                resolve();
            }
        });
    });
};

// Function to initialize the connection to the lab5 database
const connectToDatabase = () => {
    return new Promise((resolve, reject) => {
        dbConnection = mysql.createConnection({
            ...serverConfig,
            database: 'lab5'
        });

        dbConnection.connect((err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Connected to lab5 database');
                resolve();
            }
        });
    });
};

// Function to create the PATIENT table if it doesn't exist
const createPatientTable = () => {
    return new Promise((resolve, reject) => {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS PATIENT (
                patientID INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                dateOfBirth DATE
            );
        `;

        dbConnection.query(createTableQuery, (err, result) => {
            if (err) {
                reject(err);
            } else {
                console.log('Patient table checked/created.');
                resolve();
            }
        });
    });
};

// Function to execute SQL queries (with Promise for async/await)
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        if (!dbConnection) {
            reject(new Error("Database connection not initialized"));
        }
        dbConnection.query(sql, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Main function to initialize everything
const initializeDatabase = async () => {
    try {
        await createDatabaseIfNotExists();   // Create the database if needed
        await connectToDatabase();           // Connect to the database
        await createPatientTable();          // Create the table if needed
    } catch (error) {
        console.error("Error initializing the database:", error.message);  // Log the exact error message
    }
};

// Start the initialization process
initializeDatabase();

module.exports = {
    queryAsync,
    createPatientTable  
};