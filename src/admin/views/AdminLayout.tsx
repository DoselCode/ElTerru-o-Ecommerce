import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import type { UserSchema as User } from '@insforge/sdk';
import { SquaresFour, Storefront, CashRegister, Package, Receipt, ArrowsLeftRight, CheckCircle, XCircle, WarningCircle } from '@phosphor-icons/react';
import { AdminProvider, useAdmin } from '../context/AdminContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider, useToasts } from '../context/ToastContext';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { RegisterModule } from '../components/RegisterModule';
import '../admin.css';

const ToastContainer: React.FC = () => {
  const toasts = useToasts();
  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    if (type === 'success') return <CheckCircle weight="fill" size={24} style={{ color: 'var(--success)' }} />;
    if (type === 'error') return <XCircle weight="fill" size={24} style={{ color: 'var(--danger)' }} />;
    return <WarningCircle weight="fill" size={24} style={{ color: 'var(--warning)' }} />;
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {getIcon(t.type)}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

const AdminInner: React.FC = () => {
  const location = useLocation();

  const handleLogout = async () => {
    await insforge.auth.signOut();
  };

  const { isOnline, isSyncing } = useAdmin();

  return (
    <div className="admin-pos-theme app-layout">
      <ToastContainer />
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img
            src="/logoterruno.png"
            alt="Logo Terruño"
            className="sidebar-logo"
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--primary-color)' }}
          />
          <h1 className="sidebar-title">El Terruño<br /><span>ALMACÉN</span></h1>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
            <SquaresFour /> Dashboard
          </Link>
          <Link to="/admin/pos" className={`nav-item ${location.pathname === '/admin/pos' ? 'active' : ''}`}>
            <CashRegister /> Punto de Venta
          </Link>
          <Link to="/admin/stock" className={`nav-item ${location.pathname === '/admin/stock' ? 'active' : ''}`}>
            <Package /> Inventario y Stock
          </Link>
          <Link to="/admin/sales" className={`nav-item ${location.pathname === '/admin/sales' ? 'active' : ''}`}>
            <Receipt /> Ventas
          </Link>
          <Link to="/admin/settings" className={`nav-item ${location.pathname === '/admin/settings' ? 'active' : ''}`}>
            <Storefront /> Landing Page
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="top-controls card p-2" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                <Storefront size={20} />
                <span>Caja Central</span>
              </div>

              {/* Indicador de conexión */}
              {!isOnline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500 }}>
                  <WarningCircle size={16} weight="fill" />
                  Modo Offline - Guardando en cola
                </div>
              )}
              {isOnline && isSyncing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500 }}>
                  <ArrowsLeftRight size={16} weight="bold" className="spin-animation" />
                  Sincronizando a la nube...
                </div>
              )}
            </div>

            <RegisterModule />
          </div>
        </header>

        <div className="views-container">
          <ErrorBoundary key={location.pathname} variant="admin">
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      setUser(user);
    };
    loadUser().then(() => setLoadingAuth(false));
    const unsubscribe = insforge.auth.onAuthStateChange(loadUser);
    return unsubscribe;
  }, []);

  if (loadingAuth) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <ErrorBoundary variant="admin">
      <ToastProvider>
        <AdminProvider>
          <CartProvider>
            <AdminInner />
          </CartProvider>
        </AdminProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default AdminLayout;
