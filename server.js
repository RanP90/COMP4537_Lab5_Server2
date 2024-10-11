/**
 * This project includes code suggestions and assistance from ChatGPT 
 * to enhance certain functionalities and optimize code structure.
 */
const http = require('http');
const url = require('url');
const path = require('path');
const { queryAsync } = require('./db');
const { ServerError, InvalidBody, InvalidQuery, InvalidQueryType, notFound, insertSuccess, insertJSONError } = require('./lang/en/en');

const ALLOWED_ORIGIN = 'https://comp4537lab5server1.netlify.app';

// Helper function to start the server
const startServer = (port, requestHandler) => {
    const server = http.createServer(requestHandler);
    server.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
};

// Function to handle inserting data
const handleInsert = (req, res) => {
    let data = '';
  
    req.on('data', (chunk) => {
      data += chunk;
    });
  
    req.on('end', async () => {
      try {
        const jsonData = JSON.parse(data); 
        const patients = jsonData.data;
  
        // Insert query logic here
        const insertQuery = 'INSERT INTO patient (name, dateOfBirth) VALUES ?';
        const insertionData = patients.map(patient => [patient.name, patient.dateOfBirth]);
  
        await queryAsync(insertQuery, [insertionData]);
  
        // Send back a JSON response
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          });
        res.end(JSON.stringify({ message: insertSuccess }));
      } catch (error) {
        console.error("Insert Error:", error);
        res.writeHead(400, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          });
        res.end(JSON.stringify({ error: insertJSONError }));
      }
    });
  };

// Function to handle general SQL queries (POST)
const handlePostQuery = (req, res) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const query = data.query.trim().toUpperCase();

            if (!query.startsWith("SELECT") && !query.startsWith("INSERT")) {
                console.error("Invalid query type");
                res.writeHead(400, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
                  });
                res.end(JSON.stringify({ success: false, error: InvalidQueryType }));
                return;
            }

            queryAsync(query).then(result => {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
                  });
                res.end(JSON.stringify({ success: true, data: result }));
            }).catch(err => {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: InvalidQuery }));
            });
        } catch (error) {
            console.error(error);
            res.writeHead(400, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
              });
            res.end(JSON.stringify({ success: false, error: InvalidBody }));
        }
    });
};

// Handle SQL query from GET request
const handleQuery = (req, res, queryParam) => {
    queryAsync(queryParam).then(rows => {
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          });
        res.end(JSON.stringify({ success: true, data: rows }));
    }).catch(err => {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: ServerError }));
    });
};

// Main request handler for the server
const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (path === '/insert' && req.method === 'POST') {
        handleInsert(req, res);
    } else if (path === '/query') {
        if (req.method === 'GET') {
            handleQuery(req, res, parsedUrl.query.query);
        } else if (req.method === 'POST') {
            handlePostQuery(req, res);
        }
    } else {
        res.writeHead(404, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          });
        res.end(notFound);
    }
};

// Start the server on port 8008
startServer(8008, requestHandler);