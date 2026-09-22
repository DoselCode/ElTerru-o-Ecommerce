import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { insforge } from '../lib/insforge';

import { SquaresFour, Storefront, CashRegister, Package, Receipt, CaretDown, ArrowsLeftRight, CheckCircle, XCircle, WarningCircle, SignOut } from '@phosphor-icons/react';
import { AdminProvider, useAdmin } from './AdminContext';
import './admin.css';

const TopRegisterModule: React.FC = () => {
  const { state, updateRegister, showToast } = useAdmin();
  const [modalType, setModalType] = useState<'none' | 'close' | 'open' | 'movement'>('none');
  const [amount, setAmount] = useState('');
  const [movType, setMovType] = useState<'ingreso' | 'egreso'>('egreso');
  const [reason, setReason] = useState('');

  const reg = state.register;
  const isOpen = reg.status === 'abierta';

  const handleConfirmClose = () => {
    updateRegister({ status: 'cerrada', efectivo: 0, transferencia: 0, tarjeta: 0 });
    showToast('Caja cerrada y arqueada correctamente.', 'success');
    setModalType('none');
  };

  const handleConfirmOpen = () => {
    const fondo = parseFloat(amount) || 0;
    updateRegister({ status: 'abierta', efectivo: fondo, transferencia: 0, tarjeta: 0 });
    showToast('Caja abierta correctamente.', 'success');
    setModalType('none');
  };

  const handleConfirmMovement = () => {
    const val = parseFloat(amount) || 0;
    if (val <= 0) {
      showToast('Ingresa un monto válido.', 'error');
      return;
    }
    if (movType === 'egreso' && val > reg.efectivo) {
      showToast('No hay suficiente efectivo en caja.', 'error');
      return;
    }
    const newEfectivo = movType === 'egreso' ? reg.efectivo - val : reg.efectivo + val;
    updateRegister({ ...reg, efectivo: newEfectivo });
    showToast(`Movimiento registrado: ${reason}`, 'success');
    setModalType('none');
  };

  return (
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.5rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-color)' }}>
      {isOpen && (
        <button className="btn-icon" onClick={() => { setAmount(''); setReason(''); setModalType('movement'); }} title="Ingreso/Egreso de Caja" style={{ background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowsLeftRight weight="bold" />
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Estado Caja</span>
        <span className={`badge ${isOpen ? 'success' : 'danger'}`}>{reg.status.toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Efvo. en Caja</span>
        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary-color)' }}>
          ${reg.efectivo.toLocaleString()}
        </span>
      </div>
      <button className="btn-accent" style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }} onClick={() => {
        if (isOpen) {
          setModalType('close');
        } else {
          setAmount('');
          setModalType('open');
        }
      }}>
        {isOpen ? 'Cerrar / Arqueo' : 'Abrir Caja'}
      </button>

      {/* Modals for Register */}
      {modalType !== 'none' && (
        <div className="modal-overlay">
          <div className="modal-content card">
            {modalType === 'close' && (
              <>
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Cierre de Turno y Arqueo</h2>
                <div style={{ background: '#e6ffed', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '2px solid var(--success)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--success)', textTransform: 'uppercase', fontWeight: 700 }}>Efectivo Esperado en Cajón</p>
                  <p style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>${reg.efectivo.toLocaleString()}</p>
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setModalType('none')}>Cancelar</button>
                  <button className="btn-accent" onClick={handleConfirmClose}>Confirmar Cierre</button>
                </div>
              </>
            )}
            {modalType === 'open' && (
              <>
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Apertura de Caja</h2>
                <div className="form-group">
                  <label>Fondo de Caja (Cambio inicial para el día) $</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setModalType('none')}>Cancelar</button>
                  <button className="btn-accent" onClick={handleConfirmOpen}>Abrir Caja</button>
                </div>
              </>
            )}
            {modalType === 'movement' && (
              <>
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Movimiento de Caja</h2>
                <div className="form-group">
                  <label>Tipo de Movimiento</label>
                  <select value={movType} onChange={(e) => setMovType(e.target.value as 'ingreso' | 'egreso')}>
                    <option value="egreso">Egreso (Retirar dinero)</option>
                    <option value="ingreso">Ingreso (Agregar cambio)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Monto ($)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Motivo / Observación</label>
                  <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: Pago flete..." />
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setModalType('none')}>Cancelar</button>
                  <button className="btn-accent" onClick={handleConfirmMovement}>Confirmar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useAdmin();
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

            <TopRegisterModule />
          </div>
        </header>

        <div className="views-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data: { user } }) => {
      setUser(user);
      setLoadingAuth(false);
    });
    const unsubscribe = insforge.auth.onAuthStateChange(async () => { const { data: { user } } = await insforge.auth.getCurrentUser(); setUser(user); }); return () => unsubscribe();
  }, []);

  if (loadingAuth) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <AdminProvider>
      <AdminInner />
    </AdminProvider>
  );
};

export default AdminLayout;
