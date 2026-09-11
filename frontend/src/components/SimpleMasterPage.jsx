import { useEffect, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import api, { unwrapList } from '../utils/api';
import { extractError } from '../utils/format';

export default function SimpleMasterPage({
  title,
  endpoint,
  fields,
  columns,
}) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const response = await api.get(endpoint);
    setRows(unwrapList(response.data));
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, [endpoint]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {};
      fields.forEach((field) => {
        payload[field.name] = form[field.name] || '';
      });
      if (editingId) await api.put(`${endpoint}${editingId}/`, payload);
      else await api.post(endpoint, payload);
      setOpen(false);
      setForm({});
      setEditingId(null);
      setMessage(`${title} saved.`);
      await load();
    } catch (err) {
      setError(extractError(err, `Unable to save ${title.toLowerCase()}.`));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()}?`)) return;
    setError('');
    try {
      await api.delete(`${endpoint}${id}/`);
      await load();
      setMessage(`${title} deleted.`);
    } catch (err) {
      setError(extractError(err, `Unable to delete ${title.toLowerCase()}.`));
    }
  };

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm({}); setOpen(true); }}><Plus size={17} /> Add {title.toLowerCase()}</button>
      </div>
      {message && <p className="success-box">{message}</p>}
      {error && !open && <p className="error-box">{error}</p>}
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}<th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => <td key={col.key}>{row[col.key] || '—'}</td>)}
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditingId(row.id); setForm(row); setOpen(true); }} title={`Edit ${title.toLowerCase()}`} aria-label={`Edit ${title.toLowerCase()}`}><Edit3 size={14} /> Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} title={`Delete ${title.toLowerCase()}`} aria-label={`Delete ${title.toLowerCase()}`}><Trash2 size={14} /> Delete</button>
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
              <h2 className="modal-title">{editingId ? `Update ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}</h2>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close dialog"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-box">{error}</div>}
                <div className="form-grid">
                  {fields.map((field) => (
                    <div className="form-group" key={field.name}>
                      <label>{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea name={field.name} value={form[field.name] || ''} onChange={handleChange} rows="3" />
                      ) : (
                        <input name={field.name} value={form[field.name] || ''} onChange={handleChange} required={field.required} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
