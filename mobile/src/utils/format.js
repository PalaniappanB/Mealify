export function formatRupees(amount) {
  const n = Number(amount);
  return `₹${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
}

export function percentOff(original, discounted) {
  const o = Number(original);
  const d = Number(discounted);
  if (!o) return 0;
  return Math.round(((o - d) / o) * 100);
}

export function formatTimeRange(startIso, endIso) {
  const opts = { hour: 'numeric', minute: '2-digit' };
  const start = new Date(startIso).toLocaleTimeString([], opts);
  const end = new Date(endIso).toLocaleTimeString([], opts);
  return `${start} – ${end}`;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}
