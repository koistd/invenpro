import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api, { unwrapList } from '../utils/api';
import { extractError, formatMoney } from '../utils/format';

export default function QuotationsPage() {
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ supplier: '', item: '', unit_price: '', lead_time_days: 0, valid_until: '' });
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [q, i, s] = await Promise.all([api.get('/quotations/'), api.get('/items/'), api.get('/suppliers/')]);
    setRows(unwrapList(q.data));
    setItems(unwrapList(i.data));
    setSuppliers(unwrapList(s.data));
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quotations/', {
        ...form,
        unit_price: Number(form.unit_price),
        lead_time_days: Number(form.lead_time_days || 0),
        valid_until: form.valid_until || null,
      });
      setOpen(false);
      setForm({ supplier: '', item: '', unit_price: '', lead_time_days: 0, valid_until: '' });
      load();
    } catch (err) {
      setError(extractError(err, 'Unable to save quotation.'));
    }
  };

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setOpen(true)}>Add quotation</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Item</th>
                <th>Unit price</th>
                <th>Lead time (days)</th>
                <th>Valid until</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.supplier_name}</td>
                  <td>{row.item_name}</td>
                  <td>{formatMoney(row.unit_price)}</td>
                  <td>{row.lead_time_days}</td>
                  <td>{row.valid_until || '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={async () => { await api.delete(`/quotations/${row.id}/`); load(); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {open && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">New quotation</h2>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close dialog"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-box">{error}</div>}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Supplier</label>
                    <select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} required>
                      <option value="">Select</option>
                      {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Item</label>
                    <select value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} required>
                      <option value="">Select</option>
                      {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Unit price</label>
                    <input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Lead time (days)</label>
                    <input type="number" value={form.lead_time_days} onChange={(e) => setForm({ ...form, lead_time_days: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Valid until</label>
                    <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
