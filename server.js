/**
 * This project includes code suggestions and assistance from ChatGPT 
 * to enhance certain functionalities and optimize code structure.
 */

require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const { queryAsync } = require('./db');
const { ServerError, InvalidBody, InvalidQuery, InvalidQueryType, notFound, insertSuccess, insertJSONError } = require('./lang/en/en');
const ALLOWED_ORIGIN = 'https://comp4537lab5server1.netlify.app';

const app = express();
const port = 8008;

// CORS middleware
app.use(cors({
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Middleware to parse JSON body
app.use(express.json());

// Route to handle inserting data
app.post('/insert', async (req, res) => {
    try {
        const patients = req.body.data;

        // Validate if data is present
        if (!patients || !Array.isArray(patients)) {
            return res.status(400).json({ error: insertJSONError });
        }

        const insertQuery = 'INSERT INTO patient (name, dateOfBirth) VALUES ?';
        const insertionData = patients.map(patient => [patient.name, patient.dateOfBirth]);

        await queryAsync(insertQuery, [insertionData]);

        res.status(200).json({ message: insertSuccess });
    } catch (error) {
        res.status(400).json({ error: InvalidBody });
    }
});

// Route to handle general SQL queries (POST)
app.post('/query', async (req, res) => {
    try {
        const query = req.body.query ? req.body.query.trim().toUpperCase() : null;

        if (!query) {
            return res.status(400).json({ success: false, error: InvalidBody });
        }

        if (!query.startsWith("SELECT") && !query.startsWith("INSERT")) {
            return res.status(400).json({ success: false, error: InvalidQueryType });
        }

        const result = await queryAsync(query);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: InvalidQuery });
    }
});

// Route to handle SQL query from GET request
app.get('/query', async (req, res) => {
    try {
        const queryParam = req.query.query;
        const rows = await queryAsync(queryParam);
        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: ServerError });
    }
});

// Handle 404
app.use((req, res) => {
    res.status(404).send(notFound);
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});