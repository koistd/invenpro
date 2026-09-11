export function extractError(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  if (typeof first === 'string') return first;
  return fallback;
}

export function statusBadge(status) {
  const map = {
    Draft: 'badge-gray',
    Submitted: 'badge-blue',
    'Under Review': 'badge-purple',
    Approved: 'badge-green',
    Rejected: 'badge-red',
    Ordered: 'badge-teal',
    Completed: 'badge-green',
    Received: 'badge-green',
    Unpaid: 'badge-orange',
    Paid: 'badge-green',
    Overdue: 'badge-red',
    Low: 'badge-gray',
    Medium: 'badge-blue',
    High: 'badge-orange',
    Critical: 'badge-red',
    INWARD: 'badge-green',
    OUTWARD: 'badge-orange',
  };
  return map[status] || 'badge-gray';
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
