const MetroSentry = {
  nav: Navigation,
  async init() {
    Navigation.init(); Camera.init(); Analysis.init(); Incidents.init(); Doors.init(); Analytics.init(); Dashboard.init();
    document.getElementById('modal-close').onclick = Utils.hideModal;
    document.getElementById('modal-overlay').onclick = event => { if (event.target === event.currentTarget) Utils.hideModal(); };
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      document.getElementById('system-status-dot').className = `status-dot ${response.ok ? 'online' : 'offline'}`;
      document.getElementById('system-status-text').textContent = response.ok ? 'System online' : 'Backend unavailable';
      console.info('[MetroSentry]', data.service);
    } catch (error) {
      document.getElementById('system-status-dot').className = 'status-dot offline';
      document.getElementById('system-status-text').textContent = 'Backend offline';
      console.warn('[MetroSentry] Health check unavailable.', error);
    }
  }
};
document.addEventListener('DOMContentLoaded', () => MetroSentry.init());
