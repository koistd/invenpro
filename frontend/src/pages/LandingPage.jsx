import { Link } from 'react-router-dom';

const modules = [
  { title: 'Inventory control', text: 'Track SKUs, stock levels, reorder points, inward receipts, and outward issues.' },
  { title: 'Purchase requests', text: 'Raise justified requests with priority, then route them through approval.' },
  { title: 'Supplier quotes', text: 'Compare vendor prices and lead times before converting to a purchase order.' },
  { title: 'Orders & payments', text: 'Create POs, receive goods into stock, and keep bills paid on time.' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <span className="auth-logo-icon">IP</span>
          ProcureFlow
        </div>
        <nav>
          <a href="#modules">Modules</a>
          <Link to="/login">Sign in</Link>
          <Link className="btn btn-primary" to="/register">Get started</Link>
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Inventory & Procurement 2.0</p>
          <h1>A complete workspace for stock, suppliers, and purchase orders.</h1>
          <p className="hero-copy">
            ProcureFlow connects warehouse stock with procurement so teams can request, approve, order, receive, and pay from one place.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/register">Create account</Link>
            <Link className="btn btn-outline" to="/login">Sign in</Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="kpi-grid">
            <div className="kpi-card green"><span className="kpi-label">Items</span><strong className="kpi-value">Live</strong></div>
            <div className="kpi-card orange"><span className="kpi-label">Low stock</span><strong className="kpi-value">Alerts</strong></div>
            <div className="kpi-card blue"><span className="kpi-label">Requests</span><strong className="kpi-value">Approve</strong></div>
            <div className="kpi-card teal"><span className="kpi-label">Orders</span><strong className="kpi-value">Receive</strong></div>
          </div>
        </div>
      </section>

      <section id="modules" className="landing-modules">
        {modules.map((item) => (
          <article key={item.title} className="card">
            <div className="card-body">
              <h3 className="card-title">{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
