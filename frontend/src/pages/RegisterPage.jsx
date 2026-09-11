import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { extractError } from '../utils/format';

const empty = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  employee_id: '',
  password: '',
  password2: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/', form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(extractError(err, 'Unable to create account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">IP</div>
          <strong>ProcureFlow</strong>
        </div>
        <h2>Create your account</h2>
        <p>Join the inventory and procurement workspace.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>First name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Employee ID</label>
            <input name="employee_id" value={form.employee_id} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm password</label>
            <input type="password" name="password2" value={form.password2} onChange={handleChange} required />
          </div>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/">Home</Link>
          <Link to="/login">Already have an account</Link>
        </div>
      </div>
    </div>
  );
}
