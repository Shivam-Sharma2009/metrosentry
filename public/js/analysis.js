const Analysis = {
  init() { document.getElementById('btn-analyze').addEventListener('click', () => this.run()); },
  run() {
    if (!Camera.currentImageData) return;
    const results = document.getElementById('analysis-results');
    const button = document.getElementById('btn-analyze');
    button.disabled = true;
    button.querySelector('.btn-loader').hidden = false;
    results.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div><p>Preparing local evidence…</p></div>';
    window.setTimeout(() => {
      results.innerHTML = '<div class="result-card result-card--pending"><span class="eyebrow">Integration status</span><h4>Gemma AI integration pending</h4><p>The image is ready for the future AI service. No detection result or incident has been fabricated.</p><p class="subtext">Station context: ' + Utils.esc(Camera.getSelectedStation()) + '</p></div>';
      button.disabled = false;
      button.querySelector('.btn-loader').hidden = true;
      Utils.toast('Evidence prepared. AI integration is pending.', 'info');
    }, 450);
  }
};
