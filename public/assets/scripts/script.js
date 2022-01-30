// script.js

document.addEventListener('DOMContentLoaded', init);

// The initializing function, the program starts here
function init() {
  bindListeners();
}

// Add the event listeners to the dropzone and input
function bindListeners() {
  const dropZone = document.querySelector('#file-drop');
  const input = document.querySelector('input[type="file"]');
  const copy = document.querySelector('#copy');
  dropZone.addEventListener('dragover', (e) =>
    toggleDragover(e, dropZone, true)
  );
  dropZone.addEventListener('dragleave', (e) =>
    toggleDragover(e, dropZone, false)
  );
  dropZone.addEventListener('dragend', (e) =>
    toggleDragover(e, dropZone, false)
  );
  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    await flipEnvelope();
    addFilesToInput(e, dropZone);
  });
  dropZone.addEventListener('click', triggerInput);
  input.addEventListener('change', () => getFileURL(input.files));
  copy.addEventListener('click', copyLink)
}

// Changes the border effect of the dropzone when files are hovering over it
function toggleDragover(e, dropZone, isDragover) {
  e.preventDefault();
  if (isDragover) {
    dropZone.classList.add('dragover');
  } else {
    dropZone.classList.remove('dragover');
  }
}

// When files are dropped into the dropzone, add those files to the input element
function addFilesToInput(e, dropZone) {
  const input = document.querySelector('input[type="file"]');
  if (e.dataTransfer.files.length) {
    input.files = e.dataTransfer.files;
  }
  dropZone.classList.remove('dragover');
  getFileURL(input.files);
}

// Opens the input element menu
function triggerInput() {
  const input = document.querySelector('input[type="file"]');
  input.click();
}

// Uploads the files to the server and retrieves a URL to show the user
async function getFileURL(files) {
  // Construct the data
  const data = new FormData();
  Array.from(files).forEach((file) => {
    data.append('files', file, file.name);
  });
  // Send the data
  fetch('https://sendit.cqu.fr/api', {
    method: 'POST',
    headers: {
      'X-Timestamp': new Date().getTime(),
    },
    body: data,
  })
  .then(response => response.json())
  .then(data => {
    fetch(`https://cqu.fr/api/${data.url}`)
    .then(response => response.json())
    .then(async data => {
      const downloadLink = document.querySelector('#download-link');
      const qrCode = document.querySelector('#qr-code');
      const copy = document.querySelector('#copy');
      downloadLink.innerHTML = data.url;
      qrCode.setAttribute('src', `data:image/jpeg;base64,${data.qr}`);
      await sendEnvelope();
      copy.click();
    })
    .catch(err => {
      console.error(err);
    });
  })
  .catch(err => {
    console.error(err);
  });
}

function copyLink() {
  const url = document.querySelector('#download-link').innerHTML;
  navigator.clipboard.writeText(url)
    .then(() => {
      const copy = document.querySelector('#copy');
      copy.classList.toggle('copied');
      setTimeout(() => {
        copy.classList.toggle('copied');
      }, 100);
    })
    .catch(err => {
      console.error(err);
    });
}

async function flipEnvelope() {
  return new Promise((resolve, reject) => {
    const envelope = document.querySelector('#envelope');
    envelope.classList.add('flipped');
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

async function sendEnvelope() {
  return new Promise((resolve, reject) => {
    const envelope = document.querySelector('#envelope');
    envelope.classList.add('uploaded');
  setTimeout(() => {
    resolve();
  }, 1500);
});
}

window.flipEnvelope = flipEnvelope;
window.sendEnvelope = sendEnvelope;