// send-it.js

const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs');
const app = express();
const port = 3002;

// Holds uploaded files URLs
// Format - Timestamp: code
const uploadURLs = {};

// Banned URL list to avoid insensitive topics
const bannedURLs = ['KKK'];

// Set the storage directory and file's name
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Use the timestamp to create a new directory
    const dir = `uploads/${req.get('X-Timestamp')}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    callback(null, dir);
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

// settings for where and how to store the uploaded files
const upload = multer({
  preservePath: true,
  storage: storage,
});

// Set the static directory for the website
app.use(express.static('public'));

// Parse the body as a form post
app.use(express.urlencoded({ extended: true }));

// File retriever
app.get('/api/:files', (req, res) => {
  const timestamp = uploadURLs[req.params.files];

  if (!timestamp) {
    res.set('Content-Type', 'text/html')
    res.status(404).sendFile(__dirname + '/public/404.html');
  }

  const output = fs.createWriteStream(
    __dirname + `/downloads/${timestamp}.zip`
  );
  const archive = archiver('zip');
  output.on('close', function () {
    res.download(`downloads/${timestamp}.zip`, 'send-it.zip', err => {
      if (!err) {
        fs.rmSync(`uploads/${timestamp}`, { recursive: true, force: true });
        fs.rmSync(`downloads/${timestamp}.zip`);
      }
    });
  });
  archive.on('error', function (err) {
    res.set('Content-Type', 'text/html');
    res.status(500).sendFile('/public/500.html');
    throw err;
  });
  archive.pipe(output);
  archive.directory(`uploads/${timestamp}`, false);
  archive.finalize();
});

// File uploader
app.post('/api', upload.array('files'), (req, res) => {
  if (req.files) {
    console.log(req.files);
  }
  // Create a new short URL for the upload and store it
  const newURL = generateURL();
  uploadURLs[newURL] = req.get('X-Timestamp');
  // Send back the new URL!
  res.json({url:`https://sendit.cqu.fr/api/${newURL}`});
});

// Starts the server
app.listen(port, () => {
  console.log(`Send It - CQU - listening on port ${port}`);
});

/****************************/
/***   Helper Functions   ***/
/****************************/

/**
 * Generates a unique 4 character URL to use for a shortend URL
 * @returns {string} The new shortened 3 character path e.g. /PWT
 */
function generateURL() {
  const charSet = 'BCDFGHJKMNPQRSTVWXYZ';
  let shortURL = '';
  do {
    shortURL = '';
    for (let i = 0; i < 4; i++) {
      shortURL += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
  } while (
    Object.keys(uploadURLs).includes(shortURL) ||
    bannedURLs.includes(shortURL)
  );
  return shortURL;
}
