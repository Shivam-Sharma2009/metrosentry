const Navigation = {
  currentView: 'dashboard',
  titles: { dashboard: 'Overview', camera: 'AI Vision Monitor', crowd: 'Crowd Intelligence', doors: 'Platform Door Simulator', incidents: 'Incident Management', analytics: 'Analytics', settings: 'Settings' },
  init() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => item.addEventListener('click', () => this.switchView(item.dataset.view)));
    document.querySelectorAll('[data-go-view]').forEach(button => button.addEventListener('click', () => this.switchView(button.dataset.goView)));
    document.getElementById('sidebar-toggle').addEventListener('click', event => { event.stopPropagation(); document.getElementById('sidebar').classList.toggle('open'); });
    document.getElementById('main-content')?.addEventListener('click', () => document.getElementById('sidebar').classList.remove('open'));
    this._updateClock();
    window.setInterval(() => this._updateClock(), 1000);
  },
  switchView(view) {
    if (!this.titles[view]) return;
    this.currentView = view;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
    document.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === `view-${view}`));
    document.getElementById('topbar-title').textContent = this.titles[view];
    document.getElementById('sidebar').classList.remove('open');
    window.dispatchEvent(new CustomEvent('view-changed', { detail: { view } }));
  },
  _updateClock() { document.getElementById('topbar-clock').textContent = `${Utils.dateTimeStr()} IST`; }
};
