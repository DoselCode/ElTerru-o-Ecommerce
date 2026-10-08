import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { insforge } from '../../lib/insforge';
import type { UserSchema as User } from '@insforge/sdk';
import { SquaresFour, Storefront, CashRegister, Package, Receipt, ArrowsLeftRight, CheckCircle, XCircle, WarningCircle, List, SignOut } from '@phosphor-icons/react';
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
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await insforge.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  const { isOnline, isSyncing } = useAdmin();

  return (
    <div className="admin-pos-theme app-layout">
      <ToastContainer />

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ' sidebar--collapsed'}`}>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? 'Colapsar menu' : 'Expandir menu'}
          aria-label={sidebarOpen ? 'Colapsar menu' : 'Expandir menu'}
        >
          {sidebarOpen ? <XCircle size={20} weight="bold" /> : <List size={20} weight="bold" />}
        </button>

        <div className="sidebar-header">
          <img
            src="/logoterruno.png"
            alt="Logo Terruno"
            className="sidebar-logo"
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)' }}
          />
          <h1 className="sidebar-title sidebar-title--text">El Terruno<br /><span>ALMACEN</span></h1>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`} title="Dashboard">
            <SquaresFour size={20} weight={location.pathname === '/admin' ? 'fill' : 'regular'} />
            <span className="nav-label">Dashboard</span>
          </Link>
          <Link to="/admin/pos" className={`nav-item ${location.pathname === '/admin/pos' ? 'active' : ''}`} title="Punto de Venta">
            <CashRegister size={20} weight={location.pathname === '/admin/pos' ? 'fill' : 'regular'} />
            <span className="nav-label">Punto de Venta</span>
          </Link>
          <Link to="/admin/stock" className={`nav-item ${location.pathname === '/admin/stock' ? 'active' : ''}`} title="Inventario y Stock">
            <Package size={20} weight={location.pathname === '/admin/stock' ? 'fill' : 'regular'} />
            <span className="nav-label">Inventario y Stock</span>
          </Link>
          <Link to="/admin/sales" className={`nav-item ${location.pathname === '/admin/sales' ? 'active' : ''}`} title="Ventas">
            <Receipt size={20} weight={location.pathname === '/admin/sales' ? 'fill' : 'regular'} />
            <span className="nav-label">Ventas</span>
          </Link>
          <Link to="/admin/settings" className={`nav-item ${location.pathname === '/admin/settings' ? 'active' : ''}`} title="Landing Page">
            <Storefront size={20} weight={location.pathname === '/admin/settings' ? 'fill' : 'regular'} />
            <span className="nav-label">Landing Page</span>
          </Link>
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            className="nav-item"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#f87171' }}
          >
            <SignOut size={20} weight="bold" />
            <span className="nav-label">{loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="top-controls card p-2" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', fontWeight: 600, color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                <Storefront size={18} />
                <span>Caja Central</span>
              </div>

              {!isOnline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500 }}>
                  <WarningCircle size={15} weight="fill" />
                  Modo Offline
                </div>
              )}
              {isOnline && isSyncing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500 }}>
                  <ArrowsLeftRight size={15} weight="bold" className="spin-animation" />
                  Sincronizando...
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

type AccessState = 'loading' | 'admin' | 'not-admin' | 'anonymous';

// La protección real es RLS (is_admin()); esto solo evita mostrar el panel a quien no es admin.
const isAdminUser = async (user: User) => {
  const { data, error } = await insforge.database.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  return !error && Boolean(data);
};

/** Guard de las rutas /admin: exige sesión de un usuario listado en `admins` y monta los providers. */
export const AdminLayout: React.FC = () => {
  const [access, setAccess] = useState<AccessState>('loading');

  useEffect(() => {
    let cancelled = false;
    const checkAccess = async () => {
      try {
        const { data } = await insforge.auth.getCurrentUser();
        const user = data?.user;
        const next: AccessState = !user ? 'anonymous' : (await isAdminUser(user)) ? 'admin' : 'not-admin';
        if (!cancelled) setAccess(next);
      } catch (err) {
        console.error('Error checking admin access:', err);
        if (!cancelled) setAccess('anonymous');
      }
    };
    checkAccess();
    const unsubscribe = insforge.auth.onAuthStateChange(checkAccess);
    return () => {
      cancelled = true;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  if (access === 'loading') return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>;
  if (access === 'anonymous') return <Navigate to="/admin/login" replace />;
  if (access === 'not-admin') return <Navigate to="/admin/login" replace state={{ notAdmin: true }} />;

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
