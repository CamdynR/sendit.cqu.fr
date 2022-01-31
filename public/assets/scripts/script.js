// script.js

document.addEventListener('DOMContentLoaded', init);

// The initializing function, the program starts here
function init() {
  bindListeners();
}

// Add the event listeners to the dropzone and input
function bindListeners() {
  // Select the necessary elements
  const dropZone = document.querySelector('#file-drop');
  const input = document.querySelector('input[type="file"]');
  const copy = document.querySelector('#copy');
  const another = document.querySelector('#another');
  
  // Listen for if they drag and drop files into the dropzone
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

  // Listen if they click in the drop zone
  dropZone.addEventListener('click', triggerInput);
  // Listen for when they select files if they clicked in the drop zone
  input.addEventListener('change', () => getFileURL(input.files));

  // Listen for if they click the copy link button on the postcard
  copy.addEventListener('click', copyLink);
  // Listens for the "Send another" button to be clicked to reset the UI
  another.addEventListener('click', resetUI);
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

// Opens the hidden input element menu
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
    // Once we get the sendit URL, convert that to a CQU URL
    fetch(`https://cqu.fr/api/${data.url}`)
    .then(response => response.json())
    .then(async data => {
      // Once we have the CQU URL,
      // select the Postcard elements to add it to the page
      const downloadLink = document.querySelector('#download-link');
      const qrCode = document.querySelector('#qr-code');
      const copy = document.querySelector('#copy');
      // Modify those postcard elements with the new data
      downloadLink.innerHTML = data.url;
      qrCode.setAttribute('src', `data:image/jpeg;base64,${data.qr}`);
      await sendEnvelope(); // We wait here for the animation to finish
      copy.click(); // Then copy the link for the user
    })
    .catch(err => {
      // TODO - Create modal to show this error to the user
      console.error(err);
    });
  })
  .catch(err => {
    // TODO - Create modal to show this error to the user
    console.error(err);
  });
}

// Copies the link inside the download-link element and
// shows the "copied" toast
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
      // TODO - Show this error to the user
      console.error(err);
    });
}

// Adds the flipped class to the envelope to initiate the CSS which wil
// visually flip it. Waits 1 second to resolve so the animation will finish.
async function flipEnvelope() {
  return new Promise((resolve, reject) => {
    const envelope = document.querySelector('#envelope');
    envelope.classList.add('flipped');
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

// Adds the uploaded class to the envelope to initiate the CSS which wil
// visually send it. Waits 1 second to resolve so the animation will finish.
async function sendEnvelope() {
  return new Promise((resolve, reject) => {
    const envelope = document.querySelector('#envelope');
    const postcard = document.querySelector('#postcard');
    postcard.classList.remove('reset');
    envelope.classList.add('uploaded');
    setTimeout(() => {
      envelope.classList.add('reset');
      resolve();
    }, 2000);
  });
}

// Adds the uploaded class to the envelope to initiate the CSS which wil
// visually send it. Waits 1 second to resolve so the animation will finish.
async function sendPostcard() {
  return new Promise((resolve, reject) => {
    const postcard = document.querySelector('#postcard');
    postcard.classList.add('send');
    setTimeout(() => {
      postcard.classList.remove('send');
      postcard.classList.add('reset');
      resolve();
    }, 1000);
  });
}

// Removes the flipped and uploaded classes from the envelope to reset the UI.
// Also clears out the content from the postcard.
async function resetUI() {
  return new Promise(async (resOuter, rejOuter) => {
    await new Promise((resInner, rejInner) => {
      const envelope = document.querySelector('#envelope');
      envelope.classList.remove('reset');
      envelope.classList.remove('flipped');
      envelope.classList.remove('uploaded');
      sendPostcard();
      setTimeout(() => {
        resInner();
      }, 1000);
    });
    const downloadLink = document.querySelector('#download-link');
    const qrCode = document.querySelector('#qr-code');
    downloadLink.innerHTML = '';
    qrCode.setAttribute('src', '');
    resOuter();
  });
}

// DELETE these later
window.flipEnvelope = flipEnvelope;
window.sendEnvelope = sendEnvelope;