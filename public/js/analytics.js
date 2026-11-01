const Analytics = {
  init() { window.addEventListener('incidents-changed', () => this.render()); this.render(); },
  render() {
    const incidents = Store.getIncidents();
    document.getElementById('analytics-total').textContent = incidents.length;
    const active = incidents.filter(item => item.status !== 'resolved').length;
    document.getElementById('analytics-breakdown').innerHTML = `<span>${active} active</span><span>${incidents.length - active} resolved</span>`;
    this._bars('analytics-severity', incidents, ['critical', 'high', 'medium', 'low']);
    this._bars('analytics-status', incidents, ['new', 'acknowledged', 'resolved']);
    this._bars('analytics-type', incidents, [...new Set(incidents.map(item => item.title.split(' ').slice(-2).join(' ')))]);
  },
  _bars(id, incidents, labels) {
    const target = document.getElementById(id);
    target.innerHTML = labels.length ? labels.map(label => { const count = incidents.filter(item => (id === 'analytics-type' ? item.title.split(' ').slice(-2).join(' ') === label : item[id.replace('analytics-', '')] === label)).length; const width = incidents.length ? Math.round(count / incidents.length * 100) : 0; return `<div class="bar-row"><span>${Utils.esc(label)}</span><div><i style="width:${width}%"></i></div><strong>${count}</strong></div>`; }).join('') : '<span class="subtext">No records yet.</span>';
  }
};
