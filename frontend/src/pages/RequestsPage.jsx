import { useEffect, useState } from 'react';
import api, { unwrapList } from '../utils/api';
import { extractError, formatDate, statusBadge } from '../utils/format';

export default function RequestsPage() {
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ item: '', quantity: 1, priority: 'Medium', justification: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [itemRes, reqRes] = await Promise.all([api.get('/items/'), api.get('/requests/')]);
    setItems(unwrapList(itemRes.data));
    setRows(unwrapList(reqRes.data));
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests/', { ...form, quantity: Number(form.quantity) });
      setForm({ item: '', quantity: 1, priority: 'Medium', justification: '' });
      setMessage('Purchase request submitted.');
      load();
    } catch (err) {
      setError(extractError(err, 'Unable to submit request.'));
    }
  };

  return (
    <>
      <section className="card">
        <div className="card-header"><h2 className="card-title">New purchase request</h2></div>
        <form className="card-body" onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Item</label>
              <select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} required>
                <option value="">Select item</option>
                {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {['Low', 'Medium', 'High', 'Critical'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Justification</label>
            <textarea rows="3" value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Submit request</button>
          </div>
        </form>
      </section>

      <section className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header"><h2 className="card-title">All requests</h2></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Requested by</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.item_name}</td>
                  <td>{row.quantity}</td>
                  <td><span className={`badge ${statusBadge(row.priority)}`}>{row.priority}</span></td>
                  <td><span className={`badge ${statusBadge(row.status)}`}>{row.status}</span></td>
                  <td>{row.requested_by_email || '—'}</td>
                  <td>{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
