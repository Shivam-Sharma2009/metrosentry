const Doors = {
  DOOR_COUNT: 8,
  states: [],
  init() {
    const saved = Store.getDoors();
    this.states = saved?.length === this.DOOR_COUNT ? saved : Array(this.DOOR_COUNT).fill('closed');
    document.getElementById('btn-open-all-doors').onclick = () => this._setAll('open');
    document.getElementById('btn-close-all-doors').onclick = () => this._setAll('closed');
    document.getElementById('btn-emergency-doors').onclick = () => { this._setAll('sensor fault'); Utils.toast('Emergency lock simulated as sensor fault.', 'warning'); };
    window.addEventListener('doors-changed', () => this.render());
    this.render();
  },
  render() {
    document.getElementById('door-platform').innerHTML = this.states.map((state, index) => `<button class="door-unit ${state.replace(' ', '-')}" data-index="${index}" aria-label="Door ${index + 1}, ${state}"><span class="door-visual"><span class="door-panel door-panel--left"></span><span class="door-panel door-panel--right"></span></span><strong>D${String(index + 1).padStart(2, '0')}</strong><span class="door-state">${state}</span></button>`).join('');
    document.querySelectorAll('.door-unit').forEach(button => button.onclick = () => this._cycle(Number(button.dataset.index)));
    const counts = this._counts();
    document.getElementById('dashboard-door-summary').innerHTML = `<div class="door-stat"><strong>${counts.closed}</strong><span>Closed</span></div><div class="door-stat"><strong>${counts.open}</strong><span>Open</span></div><div class="door-stat door-stat--alert"><strong>${counts.alert}</strong><span>Alert states</span></div>`;
  },
  _counts() { return { closed: this.states.filter(state => state === 'closed').length, open: this.states.filter(state => state === 'open').length, alert: this.states.filter(state => state === 'obstruction' || state === 'sensor fault').length }; },
  _cycle(index) { const order = ['closed', 'open', 'obstruction', 'sensor fault']; const next = order[(order.indexOf(this.states[index]) + 1) % order.length]; this.states[index] = next; this._save(); if (next === 'obstruction' || next === 'sensor fault') this._createIncident(index, next); },
  _setAll(state) { this.states = this.states.map(() => state); this._save(); },
  _createIncident(index, state) { Store.saveIncident({ id: Utils.uid(), title: `Door D${String(index + 1).padStart(2, '0')} ${state}`, description: `Platform door simulator reported a ${state} state.`, severity: state === 'sensor fault' ? 'high' : 'critical', station: document.getElementById('header-station').value, status: 'new', simulated: true, createdAt: new Date().toISOString(), acknowledgedAt: null, resolvedAt: null }); Utils.toast(`Simulated ${state} incident created.`, 'warning'); },
  _save() { Store.saveDoors(this.states); }
};
