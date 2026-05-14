const API_BASE = `http://${window.location.hostname}:9200`;

export const getRootCause = (m, y) =>
  fetch(`${API_BASE}/api/opd/rootcause?month=${m}&year=${y}`).then(r => r.json());