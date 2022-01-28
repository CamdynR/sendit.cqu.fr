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
  dropZone.addEventListener('dragover', e => toggleDragover(e, dropZone, true));
  dropZone.addEventListener('dragleave', e => toggleDragover(e, dropZone, false));
  dropZone.addEventListener('dragend', e => toggleDragover(e, dropZone, false));
  dropZone.addEventListener('drop', e => addFilesToInput(e, dropZone));
  dropZone.addEventListener('click', triggerInput);
  input.addEventListener('change', () => getFileURL(input.files));
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
  e.preventDefault();
  const input = document.querySelector('input[type="file"]');
  if (e.dataTransfer.files.length) {
    input.files = e.dataTransfer.files;
  }
  dropZone.classList.remove('dragover');
  getFileURL(input.files)
}

// Opens the input element menu
function triggerInput() {
  const input = document.querySelector('input[type="file"]');
  input.click();
}

// Uploads the files to the server and retrieves a URL to show the user
function getFileURL(files) {
  // Construct the data
  const data = new FormData();
  Array.from(files).forEach(file => {
    data.append('files', file, file.name);
  });
  // Send the data
  fetch('https://sendit.cqu.fr/api', {
    method: 'POST',
    body: data
  });
}