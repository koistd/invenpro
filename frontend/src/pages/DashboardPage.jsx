import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { unwrapList } from '../utils/api';
import { formatDate, statusBadge } from '../utils/format';

const statsConfig = [
  { key: 'total_items', label: 'Total items', accent: 'blue', to: '/items' },
  { key: 'low_stock', label: 'Low stock', accent: 'orange', to: '/items' },
  { key: 'pending_requests', label: 'Pending requests', accent: 'red', to: '/approvals' },
  { key: 'approved', label: 'Approved', accent: 'green', to: '/requests' },
  { key: 'orders', label: 'Purchase orders', accent: 'purple', to: '/orders' },
  { key: 'payments', label: 'Unpaid bills', accent: 'teal', to: '/payments' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_items: 0,
    low_stock: 0,
    pending_requests: 0,
    approved: 0,
    orders: 0,
    payments: 0,
    low_stock_items: [],
    recent_requests: [],
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get('/dashboard/');
        setStats((prev) => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error('Could not load dashboard', error);
      }
    };
    loadDashboard();
  }, []);

  return (
    <>
      <section className="kpi-grid">
        {statsConfig.map((stat) => (
          <Link key={stat.key} to={stat.to} className={`kpi-card ${stat.accent}`}>
            <span className="kpi-label">{stat.label}</span>
            <strong className="kpi-value">{stats[stat.key]}</strong>
          </Link>
        ))}
      </section>

      <div className="split-grid">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Low stock items</h2>
            <Link to="/items" className="btn btn-outline btn-sm">View items</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Stock</th>
                  <th>Reorder</th>
                </tr>
              </thead>
              <tbody>
                {(stats.low_stock_items || []).length === 0 && (
                  <tr><td colSpan="4">No low-stock items right now.</td></tr>
                )}
                {(stats.low_stock_items || []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.current_stock}</td>
                    <td>{item.reorder_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Recent purchase requests</h2>
            <Link to="/requests" className="btn btn-outline btn-sm">View requests</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {unwrapList(stats.recent_requests).length === 0 && (
                  <tr><td colSpan="4">No purchase requests yet.</td></tr>
                )}
                {unwrapList(stats.recent_requests).map((req) => (
                  <tr key={req.id}>
                    <td>{req.item_name}</td>
                    <td>{req.quantity}</td>
                    <td><span className={`badge ${statusBadge(req.status)}`}>{req.status}</span></td>
                    <td>{formatDate(req.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
