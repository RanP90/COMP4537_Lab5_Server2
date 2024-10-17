/**
 * This project includes code suggestions and assistance from ChatGPT 
 * to enhance certain functionalities and optimize code structure.
 */

const mysql = require('mysql2');

// Initial configuration for the MySQL server connection (without specifying the database)
const serverConfig = {
    user: 'root',
    password: '',
    host: '127.0.0.1',
    port: 3306
};

// Configuration with the database once it exists
const dbConfig = {
    ...serverConfig,
    database: 'lab5'
};

// Create a connection to the MySQL server
const serverConnection = mysql.createConnection(serverConfig);

// Create a connection for the database once it's verified to exist
let dbConnection;

// Function to check or create the lab5 database
const createDatabaseIfNotExists = () => {
    return new Promise((resolve, reject) => {
        const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS lab5;`;
        serverConnection.query(createDatabaseQuery, (err, result) => {
            if (err) {
                reject(err);
            } else {
                console.log('Database lab5 checked/created.');
                resolve(result);
            }
        });
    });
};

// Function to execute SQL queries (with Promise for async/await)
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        dbConnection.query(sql, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Function to create the patient table if it doesn't exist
const createPatientTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS PATIENT (
            patientID INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            dateOfBirth DATE
        );
    `;

    dbConnection.query(createTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Patient table checked/created.');
    });
};

// Main function to handle the creation of the database and table
const initializeDatabase = async () => {
    try {
        await createDatabaseIfNotExists();

        // After the database is created, connect to it
        dbConnection = mysql.createConnection(dbConfig);
        dbConnection.connect((err) => {
            if (err) throw err;
            console.log('Connected to lab5 database');
            
            // Create the patient table
            createPatientTable();
        });

    } catch (error) {
        console.error("Error during database setup:", error);
    }
};

// Start the initialization process
initializeDatabase();