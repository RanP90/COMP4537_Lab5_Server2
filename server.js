/**
 * This project includes code suggestions and assistance from ChatGPT 
 * to enhance certain functionalities and optimize code structure.
 */

require('dotenv').config({ path: './.env' });
const express = require('express');  
const cors = require('cors');        
const { queryAsync } = require('./db');
const messages = require('./lang/en/en');
const app = express();
const port = 8008;

const ALLOWED_ORIGIN = 'https://comp4537lab5server1.netlify.app';

// Middleware to parse JSON
app.use(express.json());

// CORS middleware
app.use(cors({
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
}));

// Function to handle inserting data
app.post('/insert', async (req, res) => {
    try {
        const jsonData = req.body;
        const patients = jsonData.data;

        // Insert query logic
        const insertQuery = 'INSERT INTO patient (name, dateOfBirth) VALUES ?';
        const insertionData = patients.map(patient => [patient.name, patient.dateOfBirth]);

        await queryAsync(insertQuery, [insertionData]);

        // Send back a JSON response
        res.status(200).json({ message: messages.insertSuccess });
    } catch (error) {
        res.status(400).json({ error: messages.insertJSONError });
    }
});

// Function to handle general SQL queries (POST)
app.post('/query', async (req, res) => {
    try {
        const data = req.body;
        const query = data.query.trim().toUpperCase();

        if (!query.startsWith("SELECT") && !query.startsWith("INSERT")) {
            return res.status(400).json({ success: false, error: messages.InvalidQueryType });
        }

        const result = await queryAsync(query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: messages.InvalidQuery });
    }
});

// Function to handle SQL query from GET request
app.get('/query', async (req, res) => {
    try {
        const queryParam = req.query.query;
        const result = await queryAsync(queryParam);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: messages.ServerError });
    }
});

// 404 Route
app.use((req, res) => {
    res.status(404).send(messages.notFound);
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});