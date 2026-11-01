const Incidents = {
  filters: { severity: 'all', status: 'all' },
  init() {
    ['severity-filter', 'status-filter'].forEach(id => document.getElementById(id).addEventListener('change', event => { this.filters[id === 'severity-filter' ? 'severity' : 'status'] = event.target.value; this.render(); }));
    document.getElementById('btn-clear-filters').addEventListener('click', () => { this.filters = { severity: 'all', status: 'all' }; document.getElementById('severity-filter').value = 'all'; document.getElementById('status-filter').value = 'all'; this.render(); });
    window.addEventListener('incidents-changed', () => this.render());
    this.render();
  },
  _filtered() { return Store.getIncidents().filter(item => (this.filters.severity === 'all' || item.severity === this.filters.severity) && (this.filters.status === 'all' || item.status === this.filters.status)); },
  render() {
    const items = this._filtered();
    const html = items.length ? items.map(item => this._card(item, true)).join('') : '<div class="empty-state"><p>No incidents match these filters.</p><p class="subtext">Door obstructions and sensor faults will appear here as simulated events.</p></div>';
    document.getElementById('incident-list-full').innerHTML = html;
    document.getElementById('dashboard-incident-list').innerHTML = Store.getIncidents().slice(0, 5).map(item => this._card(item, false)).join('') || '<div class="empty-state"><p>No incidents recorded yet.</p><p class="subtext">Use the door simulator to generate a labelled test incident.</p></div>';
    this._bind(document);
    const active = Store.getIncidents().filter(item => item.status !== 'resolved').length;
    const badge = document.getElementById('incident-count-badge');
    badge.textContent = active; badge.dataset.count = active;
  },
  _card(item, actions) {
    const actionHTML = actions ? `<div class="incident-actions">${item.status === 'new' ? `<button class="btn btn--outline btn--sm" data-action="ack" data-id="${item.id}">Acknowledge</button>` : ''}${item.status === 'acknowledged' ? `<button class="btn btn--success btn--sm" data-action="resolve" data-id="${item.id}">Resolve</button>` : ''}<button class="btn btn--outline btn--sm" data-action="detail" data-id="${item.id}">Details</button></div>` : '';
    return `<article class="incident-card"><div class="incident-severity-bar ${Utils.esc(item.severity)}"></div><div class="incident-body"><div class="incident-title">${Utils.esc(item.title)} ${item.simulated ? '<span class="simulated-tag">SIMULATED</span>' : ''}</div><div class="incident-meta"><span class="status-badge status-badge--${Utils.esc(item.status)}">${Utils.esc(item.status)}</span><span class="severity-inline severity-inline--${Utils.esc(item.severity)}">${Utils.esc(item.severity)}</span><span>${Utils.esc(item.station)}</span><span>${Utils.dateTimeStr(new Date(item.createdAt))}</span></div><div class="incident-description">${Utils.esc(item.description)}</div></div>${actionHTML}</article>`;
  },
  _bind(root) { root.querySelectorAll('[data-action]').forEach(button => button.onclick = () => { const id = button.dataset.id; if (button.dataset.action === 'ack') this.acknowledge(id); else if (button.dataset.action === 'resolve') this.resolve(id); else this.detail(id); }); },
  acknowledge(id) { Store.updateIncident(id, { status: 'acknowledged', acknowledgedAt: new Date().toISOString() }); Utils.toast('Incident acknowledged.', 'info'); },
  resolve(id) { Store.updateIncident(id, { status: 'resolved', resolvedAt: new Date().toISOString() }); Utils.toast('Incident resolved.', 'success'); },
  detail(id) {
    const item = Store.getIncidents().find(incident => incident.id === id);
    if (!item) return;
    Utils.showModal({ title: item.title, bodyHTML: `<p><span class="severity-inline severity-inline--${Utils.esc(item.severity)}">${Utils.esc(item.severity)}</span> · ${Utils.esc(item.station)}</p><p>${Utils.esc(item.description)}</p><p><strong>Status:</strong> ${Utils.esc(item.status)}</p><p><strong>Created:</strong> ${Utils.dateTimeStr(new Date(item.createdAt))}</p><p class="subtext">This record is simulated and stored locally.</p>`, buttons: [{ label: 'Close', cls: 'btn--outline' }] });
  }
};
