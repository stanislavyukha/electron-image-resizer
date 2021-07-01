const path = require('path');
const os = require('os');
const { ipcRenderer } = require('electron');
const form = document.getElementById('image-form');
const slider = document.getElementById('slider');
const img = document.getElementById('img');
const currentProgress = document.getElementById('current-progress');
const totalAmount = document.getElementById('total-amount');
const progressBar = document.querySelector('.determinate');
const fileField = document.querySelector('.file-field');
const fileInput = document.querySelector('.file-input');
const uploadIcon = document.getElementById('upload-icon');
const btnInfo = document.querySelector('.btn-info');
const btnClose = document.querySelector('.btn-close');
const btnMinimize = document.querySelector('.btn-minimize');





document.getElementById('output-path').innerText = path.join(
  os.homedir(),
  'ImageResize'
);
btnInfo.addEventListener('click', () => {
  ipcRenderer.send('open-about');
})

btnClose.addEventListener('click', (ev) => {
  ipcRenderer.send("close-btn", 'main');
 })
 
btnMinimize.addEventListener('click', (ev) => {
     ipcRenderer.send("minimize-btn", true);
 })



fileField.addEventListener('dragenter', (ev) => {
  ev.preventDefault();
  uploadIcon.style.color = '#07ce17';
  uploadIcon.classList.remove('fa-images');
  uploadIcon.classList.add('fa-plus-circle');
});
fileField.addEventListener('dragleave', (ev) => {
  ev.preventDefault();
  uploadIcon.style.color = 'inherit';
  uploadIcon.classList.add('fa-images');
  uploadIcon.classList.remove('fa-plus-circle');
});

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const paths = [];
  for (let image of img.files) {
    paths.push(image.path);
  }
  const imgPath = paths;
  const quality = slider.value;
  ipcRenderer.send('image:minimize', {
    imgPath,
    quality,
  });
  totalAmount.textContent = imgPath.length;
});

fileInput.addEventListener('change', () => {
  progressBar.style.width = "0%";
  currentProgress.textContent = 0;
  totalAmount.textContent = 0;
})

ipcRenderer.on('image:converted', function (evt, message) {
  currentProgress.textContent = message + 1;
  progressBar.style.width =
    (currentProgress.textContent / totalAmount.textContent) * 100 + '%';
});