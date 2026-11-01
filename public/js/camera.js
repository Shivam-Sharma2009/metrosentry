const Camera = {
  stream: null,
  currentImageData: null,
  init() {
    document.querySelectorAll('.input-tab').forEach(tab => tab.addEventListener('click', () => {
      document.querySelectorAll('.input-tab').forEach(item => item.classList.toggle('active', item === tab));
      document.querySelectorAll('.input-panel').forEach(panel => panel.classList.toggle('active', panel.id === tab.dataset.target));
    }));
    document.getElementById('file-input').addEventListener('change', event => this._handleFile(event.target.files[0]));
    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('click', event => { if (event.target.tagName !== 'LABEL') document.getElementById('file-input').click(); });
    dropZone.addEventListener('dragover', event => { event.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', event => {
      event.preventDefault();
      dropZone.classList.remove('drag-over');
      this._handleFile(event.dataTransfer.files[0]);
    });
    document.getElementById('btn-start-camera').addEventListener('click', () => this.startCamera());
    document.getElementById('btn-capture').addEventListener('click', () => this.captureFrame());
    document.getElementById('btn-stop-camera').addEventListener('click', () => this.stopCamera());
    document.getElementById('btn-remove-image').addEventListener('click', () => this.clearImage());
    document.getElementById('station-select').addEventListener('change', event => { document.getElementById('custom-station').hidden = event.target.value !== 'Custom'; });
  },
  async _handleFile(file) {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { Utils.toast('Use a JPG, PNG, or WEBP image.', 'error'); return; }
    if (file.size > 8 * 1024 * 1024) { Utils.toast('Image must be 8 MB or smaller.', 'error'); return; }
    try { this._setImage(await Utils.fileToDataURL(file)); } catch (error) { console.error(error); Utils.toast('The image could not be read.', 'error'); }
  },
  _setImage(dataURL) {
    this.currentImageData = dataURL;
    document.getElementById('image-preview').src = dataURL;
    document.getElementById('image-preview-container').hidden = false;
    document.getElementById('btn-analyze').disabled = false;
  },
  clearImage() {
    this.currentImageData = null;
    document.getElementById('image-preview-container').hidden = true;
    document.getElementById('image-preview').removeAttribute('src');
    document.getElementById('btn-analyze').disabled = true;
    document.getElementById('file-input').value = '';
  },
  async startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { this._cameraError('Camera access is not supported in this browser.'); return; }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
      const video = document.getElementById('camera-video');
      video.srcObject = this.stream;
      document.getElementById('camera-placeholder').hidden = true;
      document.getElementById('btn-start-camera').disabled = true;
      document.getElementById('btn-capture').disabled = false;
      document.getElementById('btn-stop-camera').disabled = false;
      document.getElementById('camera-message').textContent = 'Camera ready. Capture a local snapshot when the platform is in frame.';
    } catch (error) {
      this._cameraError(error.name === 'NotAllowedError' ? 'Camera permission was denied. Allow access and try again.' : 'Camera is unavailable on this device.');
    }
  },
  _cameraError(message) { document.getElementById('camera-message').textContent = message; Utils.toast(message, 'error'); },
  captureFrame() {
    const video = document.getElementById('camera-video');
    if (!video.videoWidth) { this._cameraError('Wait for the camera preview before capturing.'); return; }
    const canvas = document.getElementById('camera-canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    this._setImage(canvas.toDataURL('image/jpeg', 0.9));
    Utils.toast('Snapshot captured locally.', 'success');
  },
  stopCamera() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    document.getElementById('camera-video').srcObject = null;
    document.getElementById('camera-placeholder').hidden = false;
    document.getElementById('btn-start-camera').disabled = false;
    document.getElementById('btn-capture').disabled = true;
    document.getElementById('btn-stop-camera').disabled = true;
  },
  getSelectedStation() { const value = document.getElementById('station-select').value; return value === 'Custom' ? document.getElementById('custom-station').value.trim() || 'Unspecified station' : value; }
};
