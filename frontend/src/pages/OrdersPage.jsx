import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api, { unwrapList } from '../utils/api';
import { extractError, formatDate, formatMoney, statusBadge } from '../utils/format';

const emptyLine = { item: '', quantity: 1, unit_price: '' };

export default function OrdersPage() {
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ supplier: '', order_number: '', status: 'Draft', items: [{ ...emptyLine }] });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [o, s, i] = await Promise.all([api.get('/orders/'), api.get('/suppliers/'), api.get('/items/')]);
    setRows(unwrapList(o.data));
    setSuppliers(unwrapList(s.data));
    setItems(unwrapList(i.data));
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, []);

  const updateLine = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.items];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, items: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/orders/', {
        supplier: Number(form.supplier),
        order_number: form.order_number,
        status: form.status,
        items: form.items
          .filter((line) => line.item)
          .map((line) => ({
            item: Number(line.item),
            quantity: Number(line.quantity),
            unit_price: Number(line.unit_price),
          })),
      });
      setOpen(false);
      setForm({ supplier: '', order_number: '', status: 'Draft', items: [{ ...emptyLine }] });
      setMessage('Purchase order created.');
      load();
    } catch (err) {
      setError(extractError(err, 'Unable to create purchase order.'));
    }
  };

  const receive = async (id) => {
    try {
      await api.post(`/orders/${id}/receive/`);
      setMessage('Goods received and stock updated.');
      load();
    } catch (err) {
      setError(extractError(err, 'Unable to receive order.'));
    }
  };

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setOpen(true)}>New purchase order</button>
      </div>
      {message && <p className="success-box">{message}</p>}
      {error && !open && <p className="error-box">{error}</p>}
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO number</th>
                <th>Supplier</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
                <th>Lines</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.order_number}</td>
                  <td>{row.supplier_name}</td>
                  <td>{formatMoney(row.total_amount)}</td>
                  <td><span className={`badge ${statusBadge(row.status)}`}>{row.status}</span></td>
                  <td>{formatDate(row.created_at)}</td>
                  <td>{(row.items || []).length}</td>
                  <td>
                    {row.status !== 'Received' && (
                      <button className="btn btn-accent btn-sm" onClick={() => receive(row.id)}>Receive</button>
                    )}
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
              <h2 className="modal-title">Create purchase order</h2>
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
                    <label>Order number</label>
                    <input value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {['Draft', 'Ordered', 'Received'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <h3 style={{ margin: '1.25rem 0 0.75rem' }}>Line items</h3>
                {form.items.map((line, index) => (
                  <div className="form-grid" key={index} style={{ marginBottom: '0.75rem' }}>
                    <div className="form-group">
                      <label>Item</label>
                      <select value={line.item} onChange={(e) => updateLine(index, 'item', e.target.value)} required>
                        <option value="">Select</option>
                        {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Qty</label>
                      <input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Unit price</label>
                      <input type="number" step="0.01" value={line.unit_price} onChange={(e) => updateLine(index, 'unit_price', e.target.value)} required />
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm({ ...form, items: [...form.items, { ...emptyLine }] })}>
                  Add line
                </button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Create order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
