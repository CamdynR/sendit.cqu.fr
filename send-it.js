// send-it.js

const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs-extra');
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
    fs.ensureDir(dir);
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
  // Grab the timestamp of the requested files
  const timestamp = uploadURLs[req.params.files];
  // If the timestamp doesn't exist, send a 404 page
  if (!timestamp) {
    res.set('Content-Type', 'text/html')
    res.status(404).sendFile(__dirname + '/public/404.html');
  }

  const dir = __dirname + `/uploads/${timestamp}`;

  // Checks if there is a ZIP file ready
  if (fs.existsSync(__dirname + `/downloads/${timestamp}.zip`)) {
    res.download(`downloads/${timestamp}.zip`, 'send-it.zip', err => {
      if (!err) {
        fs.rmSync(`uploads/${timestamp}`, { recursive: true, force: true });
        fs.rmSync(`downloads/${timestamp}.zip`);
        delete uploadURLs[req.params.files];
      } else {
        res.set('Content-Type', 'text/html');
        res.status(500).sendFile(__dirname + '/public/500.html');
      }
    });
  // Otherwise there should be a folder with a single file in it
  } else if (fs.readdirSync(dir).length == 1) {
    const file = fs.readdirSync(dir)[0];
    res.download(`uploads/${timestamp}/${file}`, file, err => {
      if (!err) {
        fs.rmSync(`uploads/${timestamp}`, { recursive: true, force: true });
        fs.rmSync(`downloads/${timestamp}`, { recursive: true, force: true });
        delete uploadURLs[req.params.files];
      } else {
        res.set('Content-Type', 'text/html');
        res.status(500).sendFile(__dirname + '/public/500.html');
      }
    });
  // Otherwise the files don't exist
  } else {
    res.set('Content-Type', 'text/html')
    res.status(404).sendFile(__dirname + '/public/404.html');
  }
});

// File uploader. Multer takes care of creating the necessary folders / files.
app.post('/api', upload.array('files'), (req, res) => {
  // Grab the timestamp from the request headers
  const timestamp = req.get('X-Timestamp');

  // ZIP if there are multiple files
  if (req.files.length > 1) {
    // Create an output location for the download zip
    const output = fs.createWriteStream(
      __dirname + `/downloads/${timestamp}.zip`
    );
    // Create a zip archive object
    const archive = archiver('zip');
    // Handle what happens when the archiver is done
    output.on('close', function () {
      // Create a new short URL for the upload and store it
      const newURL = generateURL();
      uploadURLs[newURL] = timestamp;
      // Send back the new URL!
      res.json({url:`https://sendit.cqu.fr/api/${newURL}`});
    });
    // Handle what happens if the zip archiver runs into an error
    archive.on('error', function (err) {
      res.set('Content-Type', 'text/html');
      res.status(500).sendFile('/public/500.html');
      throw err;
    });
    archive.pipe(output);
    archive.directory(`uploads/${timestamp}`, false);
    archive.finalize();
  } else {
    // Create a new short URL for the upload and store it
    const newURL = generateURL();
    uploadURLs[newURL] = timestamp;
    // Send back the new URL!
    res.json({url:`https://sendit.cqu.fr/api/${newURL}`});
  }
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
