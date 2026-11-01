const Analysis = {
  init() {
    document.getElementById('btn-analyze').addEventListener('click', () => this.run());
  },
  escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  },
  render(payload, station) {
    const a = payload.analysis || {};
    const e = value => this.escape(value);
    const risk = ['low', 'medium', 'high', 'critical', 'unknown'].includes(a.riskLevel) ? a.riskLevel : 'unknown';
    const list = value => Array.isArray(value) && value.length
      ? value.map(item => '<li>' + e(item) + '</li>').join('')
      : '<li>No reliable details returned.</li>';
    const confidence = Number.isFinite(Number(a.confidence)) ? Math.round(Number(a.confidence)) + '% (model estimate)' : 'Not provided';
    return `
      <div class="result-card result-card--pending">
        <span class="eyebrow">Gemma 4 · Preliminary visual review</span>
        <h4>Risk level: ${e(risk.toUpperCase())}</h4>
        <p>${e(a.summary)}</p>
        <p><strong>Category:</strong> ${e(a.category)}</p>
        <p><strong>Confidence:</strong> ${e(confidence)}</p>
        <h4>Visible observations</h4><ul>${list(a.observations)}</ul>
        <h4>Suggested operator action</h4><p>${e(a.recommendedAction)}</p>
        <h4>Limitations</h4><ul>${list(a.limitations)}</ul>
        <p class="subtext">Station: ${e(station)} · Model: ${e(payload.model)}</p>
        <div class="sim-disclaimer-banner">Human review required. AI output may be wrong and is not a certified safety assessment. No incident was created automatically.</div>
      </div>`;
  },
  async run() {
    if (!Camera.currentImageData) return;
    const results = document.getElementById('analysis-results');
    const button = document.getElementById('btn-analyze');
    const loader = button.querySelector('.btn-loader');
    button.disabled = true;
    if (loader) loader.hidden = false;
    results.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div><p>Analyzing image with Gemma 4…</p></div>';
    try {
      const [header, encoded] = Camera.currentImageData.split(',');
      const mime = (header.match(/data:(.*?);base64/) || [])[1] || 'image/jpeg';
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const extension = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
      const form = new FormData();
      form.append('image', new Blob([bytes], { type: mime }), 'platform-frame.' + extension);
      form.append('station', Camera.getSelectedStation());
      const response = await fetch('/api/analyze/frame', { method: 'POST', body: form });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Analysis failed (HTTP ' + response.status + ').');
      if (!payload.analysis) throw new Error('AI response was incomplete.');
      results.innerHTML = this.render(payload, Camera.getSelectedStation());
      Utils.toast('Gemma analysis received. Human review required.', 'success');
    } catch (error) {
      results.innerHTML = '<div class="result-card result-card--pending"><span class="eyebrow">Analysis unavailable</span><h4>Could not complete image analysis</h4><p>' + this.escape(error.message || 'Unknown error') + '</p><p class="subtext">Check server configuration, API access, and model availability.</p></div>';
      Utils.toast('Image analysis failed.', 'error');
    } finally {
      button.disabled = false;
      if (loader) loader.hidden = true;
    }
  }
};
