import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import CategoriesPage from './pages/CategoriesPage';
import UnitsPage from './pages/UnitsPage';
import StockPage from './pages/StockPage';
import RequestsPage from './pages/RequestsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import SuppliersPage from './pages/SuppliersPage';
import QuotationsPage from './pages/QuotationsPage';
import OrdersPage from './pages/OrdersPage';
import PaymentsPage from './pages/PaymentsPage';
import { isAuthenticated } from './utils/auth';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/units" element={<UnitsPage />} />
        <Route path="/stock/:type" element={<StockPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/quotations" element={<QuotationsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}
