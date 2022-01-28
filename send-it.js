// send-it.js

const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 3002;

// Set the static directory for the website
app.use(express.static('public'));

// Parse the body as a form post
app.use(express.urlencoded({ extended: true }))

// File retriever
app.get('/api/:file', (req, res) => {
  res.send('Hello, World!');
});

// File uploader
app.post('/api', array(files), (req, res) => {
  res.send('Success!');
});

// Starts the server
app.listen(port, () => {
  console.log(`Send It - CQU - listening on port ${port}`);
});

/****************************/
/***   Helper Functions   ***/
/****************************/
