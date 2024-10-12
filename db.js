/**
 * This project includes code suggestions and assistance from ChatGPT 
 * to enhance certain functionalities and optimize code structure.
 */

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Configuration for the database connection with hardcoded values
const config = {
    user: 'root',  
    password: '',  
    host: '127.0.0.1',  
    port: 3306,  
    database: 'lab5',  
};

// Create a connection to MySQL
const connection = mysql.createConnection(config);

// Function to check if the database connection is successful
const checkDbConnection = () => {
    connection.ping((err) => {
        if (err) {
            console.error('Error: Unable to connect to the database:', err.message);
        } else {
            console.log('Connection to MySQL database is active.');
        }
    });
};

// Connect to the database and log status
connection.connect((err) => {
    if (err) {
        console.error('Error: Could not connect to MySQL database:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
    // Create the table if it doesn't exist
    createPatientTable();
    // Check the database connection status
    checkDbConnection();
});

// Function to execute SQL queries (with Promise for async/await)
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, result) => {
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

    connection.query(createTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Patient table checked/created.');
    });
};

// Export the queryAsync function
module.exports = {
    queryAsync
};