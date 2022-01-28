// send-it.js

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 3002;

// Set the storage directory and file's name
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const dir = `uploads/${new Date().getTime()}`;
    fs.mkdirSync(dir);
    callback(null, dir);
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});
const upload = multer({ dest: 'uploads/', preservePath: true, storage: storage });

// Set the static directory for the website
app.use(express.static('public'));

// Parse the body as a form post
app.use(express.urlencoded({ extended: true }))

// File retriever
// app.get('/api/:file', (req, res) => {
//   res.send('Hello, World!');
// });

// File uploader
// app.post('/api', upload.array('files'), (req, res) => {
//   if (req.files) {
//     console.log(req.files);
//   }
//   res.send('Success!');
// });

// Starts the server
app.listen(port, () => {
  console.log(`Send It - CQU - listening on port ${port}`);
});

/****************************/
/***   Helper Functions   ***/
/****************************/
