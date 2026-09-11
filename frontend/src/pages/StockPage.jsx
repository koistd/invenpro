import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { unwrapList } from '../utils/api';
import { extractError, formatDate, statusBadge } from '../utils/format';

export default function StockPage() {
  const { type } = useParams();
  const isInward = type !== 'outward';
  const endpoint = isInward ? '/stock/inward/' : '/stock/outward/';
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ item: '', quantity: 1, reference: '', notes: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [itemRes, txRes] = await Promise.all([api.get('/items/'), api.get(endpoint)]);
    setItems(unwrapList(itemRes.data));
    setRows(unwrapList(txRes.data));
  };

  useEffect(() => {
    setMessage('');
    setError('');
    load().catch((err) => setError(extractError(err)));
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(endpoint, { ...form, quantity: Number(form.quantity) });
      setForm({ item: '', quantity: 1, reference: '', notes: '' });
      setMessage(isInward ? 'Stock received.' : 'Stock issued.');
      load();
    } catch (err) {
      setError(extractError(err, 'Unable to record transaction.'));
    }
  };

  return (
    <>
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">{isInward ? 'Receive stock' : 'Issue stock'}</h2>
        </div>
        <form className="card-body" onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Item</label>
              <select name="item" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} required>
                <option value="">Select item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (stock {item.current_stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Reference</label>
              <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="GRN / issue note" />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">{isInward ? 'Record inward' : 'Record outward'}</button>
          </div>
        </form>
      </section>

      <section className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header"><h2 className="card-title">Recent transactions</h2></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.item_name}</td>
                  <td><span className={`badge ${statusBadge(row.transaction_type)}`}>{row.transaction_type}</span></td>
                  <td>{row.quantity}</td>
                  <td>{row.reference || '—'}</td>
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
