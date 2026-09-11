import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api, { unwrapList } from '../utils/api';
import { extractError, formatMoney, statusBadge } from '../utils/format';

export default function PaymentsPage() {
  const [rows, setRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    purchase_order: '',
    bill_number: '',
    bill_date: '',
    total_amount: '',
    status: 'Unpaid',
  });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [p, o] = await Promise.all([api.get('/payments/'), api.get('/orders/')]);
    setRows(unwrapList(p.data));
    setOrders(unwrapList(o.data));
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments/', {
        ...form,
        purchase_order: Number(form.purchase_order),
        total_amount: Number(form.total_amount),
      });
      setOpen(false);
      setForm({ purchase_order: '', bill_number: '', bill_date: '', total_amount: '', status: 'Unpaid' });
      load();
    } catch (err) {
      setError(extractError(err, 'Unable to save payment.'));
    }
  };

  const markPaid = async (row) => {
    await api.patch(`/payments/${row.id}/`, { status: 'Paid' });
    load();
  };

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setOpen(true)}>Record bill</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill</th>
                <th>PO</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.bill_number}</td>
                  <td>{row.po_number}</td>
                  <td>{row.bill_date}</td>
                  <td>{formatMoney(row.total_amount)}</td>
                  <td><span className={`badge ${statusBadge(row.status)}`}>{row.status}</span></td>
                  <td>
                    {row.status !== 'Paid' && (
                      <button className="btn btn-primary btn-sm" onClick={() => markPaid(row)}>Mark paid</button>
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
              <h2 className="modal-title">New bill / payment</h2>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close dialog"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-box">{error}</div>}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Purchase order</label>
                    <select value={form.purchase_order} onChange={(e) => setForm({ ...form, purchase_order: e.target.value })} required>
                      <option value="">Select</option>
                      {orders.map((o) => <option key={o.id} value={o.id}>{o.order_number}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Bill number</label>
                    <input value={form.bill_number} onChange={(e) => setForm({ ...form, bill_number: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Bill date</label>
                    <input type="date" value={form.bill_date} onChange={(e) => setForm({ ...form, bill_date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {['Unpaid', 'Paid', 'Overdue'].map((s) => <option key={s}>{s}</option>)}
                    </select>
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
