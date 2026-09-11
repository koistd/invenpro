import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  Boxes,
  ClipboardCheck,
  CreditCard,
  FileChartColumn,
  FilePenLine,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PackageMinus,
  PackagePlus,
  ShoppingCart,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { clearToken, displayName, getUser, initials } from '../utils/auth';

const titles = {
  '/dashboard': ['Dashboard', 'Live inventory and procurement snapshot'],
  '/items': ['Items', 'Catalog, stock levels, and pricing'],
  '/categories': ['Categories', 'Organize inventory groups'],
  '/units': ['Units', 'Measurement units for items'],
  '/stock/inward': ['Stock Inward', 'Receive goods into warehouse'],
  '/stock/outward': ['Stock Outward', 'Issue stock to departments'],
  '/requests': ['Purchase Requests', 'Raise and track procurement needs'],
  '/approvals': ['Approvals', 'Review submitted purchase requests'],
  '/suppliers': ['Suppliers', 'Vendor directory and contacts'],
  '/quotations': ['Quotations', 'Compare supplier pricing'],
  '/orders': ['Purchase Orders', 'Create, track, and receive POs'],
  '/payments': ['Payments', 'Bills and payment status'],
};

const links = [
  { section: 'Overview', items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    section: 'Inventory',
    items: [
      { to: '/items', label: 'Items', icon: Boxes },
      { to: '/categories', label: 'Categories', icon: FolderTree },
      { to: '/units', label: 'Units', icon: Package },
      { to: '/stock/inward', label: 'Stock Inward', icon: PackagePlus },
      { to: '/stock/outward', label: 'Stock Outward', icon: PackageMinus },
    ],
  },
  {
    section: 'Procurement',
    items: [
      { to: '/requests', label: 'Purchase Requests', icon: FilePenLine },
      { to: '/approvals', label: 'Approvals', icon: ClipboardCheck },
      { to: '/suppliers', label: 'Suppliers', icon: Users },
      { to: '/quotations', label: 'Quotations', icon: FileChartColumn },
      { to: '/orders', label: 'Purchase Orders', icon: ShoppingCart },
      { to: '/payments', label: 'Payments', icon: CreditCard },
    ],
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useMemo(() => getUser(), []);
  const [open, setOpen] = useState(false);
  const [title, subtitle] = titles[location.pathname] || ['ProcureFlow', 'Inventory & procurement'];

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="page-shell">
      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Close menu" />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-hidden="true"><Truck size={20} /></div>
          <span>ProcureFlow</span>
        </div>
        {links.map((group) => (
          <div className="sidebar-section" key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <item.icon className="icon" size={18} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials(user)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{displayName(user)}</div>
              <div className="sidebar-user-role">{user?.role?.name || user?.email || 'Signed in'}</div>
            </div>
          </div>
          <button className="btn btn-outline btn-full btn-sm" onClick={handleLogout}><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <div>
            <button className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close menu' : 'Open menu'}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="topbar-title">{title}</h1>
            {subtitle && <p className="topbar-sub">{subtitle}</p>}
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
