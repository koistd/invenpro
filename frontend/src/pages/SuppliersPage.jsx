import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api, { unwrapList } from '../utils/api';
import { extractError } from '../utils/format';

const empty = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  tax_id: '',
  performance_notes: '',
};

export default function SuppliersPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = async () => {
    const response = await api.get('/suppliers/');
    setRows(unwrapList(response.data));
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/suppliers/${editingId}/`, form);
      else await api.post('/suppliers/', form);
      setOpen(false);
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(extractError(err, 'Unable to save supplier.'));
    }
  };

  const filtered = rows.filter((row) => `${row.name} ${row.email}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div className="toolbar">
        <input className="search-input" placeholder="Search suppliers" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn btn-primary" onClick={() => { setForm(empty); setEditingId(null); setOpen(true); }}>Add supplier</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.contact_person || '—'}</td>
                  <td>{row.email || '—'}</td>
                  <td>{row.phone || '—'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditingId(row.id); setForm(row); setOpen(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={async () => { await api.delete(`/suppliers/${row.id}/`); load(); }}>Delete</button>
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
              <h2 className="modal-title">{editingId ? 'Update supplier' : 'Add supplier'}</h2>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close dialog"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-box">{error}</div>}
                <div className="form-grid">
                  {['name', 'contact_person', 'email', 'phone', 'tax_id'].map((field) => (
                    <div className="form-group" key={field}>
                      <label>{field.replace('_', ' ')}</label>
                      <input name={field} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={field === 'name'} />
                    </div>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Address</label>
                  <textarea rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Performance notes</label>
                  <textarea rows="2" value={form.performance_notes} onChange={(e) => setForm({ ...form, performance_notes: e.target.value })} />
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
