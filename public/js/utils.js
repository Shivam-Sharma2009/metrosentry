/* ═══════════════════════════════════════════
   MetroSentry AI — Utilities
   ═══════════════════════════════════════════ */
const Utils = {
  /** Generate a short unique ID */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  /** Format a Date to HH:MM:SS */
  timeStr(d = new Date()) {
    return d.toLocaleTimeString('en-IN', { hour12: false });
  },

  /** Format a Date to DD MMM YYYY, HH:MM */
  dateTimeStr(d = new Date()) {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  },

  /** Show toast notification */
  toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('leaving');
      el.addEventListener('animationend', () => el.remove());
    }, duration);
  },

  /** Show modal */
  showModal({ title, bodyHTML, buttons = [] }) {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    const footer = document.getElementById('modal-footer');
    footer.innerHTML = '';
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.className = `btn ${b.cls || 'btn--outline'}`;
      btn.textContent = b.label;
      btn.onclick = () => { b.action?.(); Utils.hideModal(); };
      footer.appendChild(btn);
    });
    overlay.hidden = false;
  },

  hideModal() {
    document.getElementById('modal-overlay').hidden = true;
  },

  /** Escape HTML */
  esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /** Convert file to base64 data URL */
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /** Extract base64 content from data URL */
  dataURLtoBase64(dataURL) {
    return dataURL.split(',')[1];
  },

  /** Get MIME type from data URL */
  dataURLtoMime(dataURL) {
    return dataURL.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';
  }
};

