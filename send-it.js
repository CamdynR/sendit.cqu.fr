// send-it.js

const express = require('express');
const app = express();
const port = 3002;

app.use(express.static('public'));

// File retriever
app.get('/api/:file', (req, res) => {
  res.send('Hello, World!');
});

// File uploader
app.post('/api', (req, res) => {
  res.send('Hello, World!');
});

// Starts the server
app.listen(port, () => {
  console.log(`Send It - CQU - listening on port ${port}`);
});

/****************************/
/***   Helper Functions   ***/
/****************************/
