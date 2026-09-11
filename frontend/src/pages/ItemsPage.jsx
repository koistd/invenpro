import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api, { unwrapList } from '../utils/api';
import { extractError, formatMoney } from '../utils/format';

const emptyForm = {
  sku: '',
  name: '',
  description: '',
  category_id: '',
  unit_id: '',
  reorder_level: 0,
  current_stock: 0,
  price: 0,
};

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const fetchAll = async () => {
    const [itemsRes, catRes, unitRes] = await Promise.all([
      api.get('/items/'),
      api.get('/categories/'),
      api.get('/units/'),
    ]);
    setItems(unwrapList(itemsRes.data));
    setCategories(unwrapList(catRes.data));
    setUnits(unwrapList(unitRes.data));
  };

  useEffect(() => {
    fetchAll().catch((err) => setError(extractError(err, 'Unable to load items.')));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const payload = () => ({
    ...form,
    category_id: form.category_id ? Number(form.category_id) : null,
    unit_id: form.unit_id ? Number(form.unit_id) : null,
    reorder_level: Number(form.reorder_level || 0),
    current_stock: Number(form.current_stock || 0),
    price: Number(form.price || 0),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/items/${editingId}/`, payload());
      } else {
        await api.post('/items/', payload());
      }
      setForm(emptyForm);
      setEditingId(null);
      setOpen(false);
      setMessage('Item saved successfully.');
      fetchAll();
    } catch (err) {
      setError(extractError(err, 'Unable to save item.'));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      sku: item.sku,
      name: item.name,
      description: item.description || '',
      category_id: item.category?.id || '',
      unit_id: item.unit?.id || '',
      reorder_level: item.reorder_level,
      current_stock: item.current_stock,
      price: item.price,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await api.delete(`/items/${id}/`);
    fetchAll();
  };

  const filtered = items.filter((item) =>
    `${item.sku} ${item.name}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="toolbar">
        <input className="search-input" placeholder="Search SKU or name" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm(emptyForm); setOpen(true); }}>Add item</button>
      </div>
      {message && <p className="success-box">{message}</p>}
      {error && !open && <p className="error-box">{error}</p>}

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Reorder</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.sku}</td>
                  <td>{item.name}</td>
                  <td>{item.category?.name || '—'}</td>
                  <td>{item.current_stock} {item.unit?.symbol || ''}</td>
                  <td>{item.reorder_level}</td>
                  <td>{formatMoney(item.price)}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
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
              <h2 className="modal-title">{editingId ? 'Update item' : 'Add item'}</h2>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close dialog"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="error-box">{error}</div>}
                <div className="form-grid">
                  <div className="form-group"><label>SKU</label><input name="sku" value={form.sku} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Category</label>
                    <select name="category_id" value={form.category_id} onChange={handleChange}>
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Unit</label>
                    <select name="unit_id" value={form.unit_id} onChange={handleChange}>
                      <option value="">Select unit</option>
                      {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Reorder level</label><input type="number" name="reorder_level" value={form.reorder_level} onChange={handleChange} /></div>
                  <div className="form-group"><label>Current stock</label><input type="number" name="current_stock" value={form.current_stock} onChange={handleChange} /></div>
                  <div className="form-group"><label>Price</label><input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} /></div>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
