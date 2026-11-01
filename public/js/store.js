/* ═══════════════════════════════════════════
   MetroSentry AI — LocalStorage Store
   ═══════════════════════════════════════════ */
const Store = {
  KEYS: {
    INCIDENTS: 'metrosentry_incidents',
    ANALYSES:  'metrosentry_analyses_count',
    DOORS:     'metrosentry_doors',
  },

  _get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(`[MetroSentry] Could not read ${key} from LocalStorage.`, error);
      return fallback;
    }
  },

  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[MetroSentry] Could not save ${key} to LocalStorage.`, error);
      Utils.toast('Unable to persist local data.', 'error');
    }
  },

  /* ── Incidents ── */
  getIncidents() {
    return this._get(this.KEYS.INCIDENTS, []);
  },

  saveIncident(incident) {
    const list = this.getIncidents();
    list.unshift(incident);
    this._set(this.KEYS.INCIDENTS, list);
    this._dispatch('incidents-changed');
  },

  updateIncident(id, updates) {
    const list = this.getIncidents();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      Object.assign(list[idx], updates);
      this._set(this.KEYS.INCIDENTS, list);
      this._dispatch('incidents-changed');
    }
  },

  clearIncidents() {
    this._set(this.KEYS.INCIDENTS, []);
    this._dispatch('incidents-changed');
  },

  /* ── Analysis counter ── */
  getAnalysesCount() {
    return this._get(this.KEYS.ANALYSES, 0);
  },

  incrementAnalyses() {
    const n = this.getAnalysesCount() + 1;
    this._set(this.KEYS.ANALYSES, n);
    this._dispatch('analyses-changed');
    return n;
  },

  /* ── Door states ── */
  getDoors() {
    return this._get(this.KEYS.DOORS, null);
  },

  saveDoors(doors) {
    this._set(this.KEYS.DOORS, doors);
    this._dispatch('doors-changed');
  },

  /* ── Events ── */
  _dispatch(name) {
    window.dispatchEvent(new CustomEvent(name));
  }
};
