import React, { useMemo, useState } from 'react';
import { ArrowsLeftRight, Info, Coins, Money, Archive, X } from '@phosphor-icons/react';
import { useAdmin } from './AdminContext';
import type { RegisterMovement } from './types';
import { TICKET_CONFIG } from './ticketConfig';
import { PAYMENT_LABELS, PAYMENT_METHODS, formatMoney, formatOpening, formatTime, getRegisterSummary, padNumber } from './posUtils';
import { Paginator, usePaginator } from './Paginator';

type ModalType = 'none' | 'close' | 'open' | 'movement';

const Row: React.FC<{ label: React.ReactNode; value: React.ReactNode; muted?: boolean }> = ({ label, value, muted }) => (
  <div className={`caja-row${muted ? ' muted' : ''}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

/** Lista paginada de movimientos del cierre de caja */
const MovementsPage: React.FC<{ list: { id: string; createdAt: string; label: string; amount: number }[] }> = ({ list }) => {
  const { page, totalPages, setPage, slice } = usePaginator(list, 10);
  return (
    <>
      <div className="caja-movements">
        {slice.map(m => (
          <Row
            key={m.id}
            label={<><span className="caja-time">{formatTime(m.createdAt)}</span>{m.label}</>}
            value={<span style={{ color: m.amount < 0 ? 'var(--danger)' : undefined }}>{m.amount < 0 ? '-' : ''}{formatMoney(Math.abs(m.amount))}</span>}
          />
        ))}
      </div>
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} windowSize={5} />
    </>
  );
};

export const RegisterModule: React.FC = () => {
  const { state, updateRegister, showToast } = useAdmin();
  const [modalType, setModalType] = useState<ModalType>('none');
  const [amount, setAmount] = useState('');
  const [movType, setMovType] = useState<'ingreso' | 'egreso'>('egreso');
  const [reason, setReason] = useState('');
  const [showMovements, setShowMovements] = useState(false);

  const reg = state.register;
  const isOpen = reg.status === 'abierta';
  const summary = useMemo(() => getRegisterSummary(reg, state.orders), [reg, state.orders]);

  const openModal = (type: ModalType) => {
    if (type === 'open') setAmount(reg.saldoProxima > 0 ? String(reg.saldoProxima) : '');
    else setAmount('');
    setReason('');
    setShowMovements(false);
    setModalType(type);
  };

  const handleConfirmOpen = () => {
    if (amount.trim() === '') {
      showToast('Contá el efectivo del cajón e ingresá el monto inicial.', 'error');
      return;
    }
    const inicial = parseFloat(amount);
    if (isNaN(inicial) || inicial < 0) {
      showToast('Ingresá un monto válido.', 'error');
      return;
    }
    updateRegister({
      status: 'abierta',
      efectivoInicial: inicial,
      openedAt: new Date().toISOString(),
      numero: reg.numero + 1,
      saldoProxima: reg.saldoProxima,
      movimientos: []
    });
    showToast(`Caja N° ${reg.numero + 1} abierta con ${formatMoney(inicial)}.`, 'success');
    setModalType('none');
  };

  const handleConfirmClose = () => {
    const dejar = parseFloat(amount) || 0;
    if (dejar < 0) {
      showToast('Ingresá un monto válido.', 'error');
      return;
    }
    if (dejar > summary.efectivoEnCajon) {
      showToast(`No podés dejar más de ${formatMoney(summary.efectivoEnCajon)} (efectivo en cajón).`, 'error');
      return;
    }
    // Se conserva la sesión (apertura, número, movimientos) como registro del último cierre
    updateRegister({ ...reg, status: 'cerrada', saldoProxima: dejar });
    showToast('Caja cerrada y arqueada correctamente.', 'success');
    setModalType('none');
  };

  const handleConfirmMovement = () => {
    const val = parseFloat(amount) || 0;
    if (val <= 0) {
      showToast('Ingresá un monto válido.', 'error');
      return;
    }
    if (movType === 'egreso' && val > summary.efectivoEnCajon) {
      showToast('No hay suficiente efectivo en caja.', 'error');
      return;
    }
    const movement: RegisterMovement = {
      id: crypto.randomUUID(),
      type: movType,
      amount: val,
      reason: reason.trim() || 'Sin motivo',
      createdAt: new Date().toISOString()
    };
    updateRegister({ ...reg, movimientos: [...reg.movimientos, movement] });
    showToast(`Movimiento registrado: ${movement.reason}`, 'success');
    setModalType('none');
  };

  const movementsList = useMemo(() => {
    const ventas = summary.sessionOrders.map(o => ({
      id: o.id,
      createdAt: o.createdAt!,
      label: `Venta ${o.ticketNumber ? `T ${padNumber(o.ticketNumber, 8)}` : ''} · ${PAYMENT_LABELS[o.paymentMethod]}`,
      amount: o.total
    }));
    const manuales = reg.movimientos.map(m => ({
      id: m.id,
      createdAt: m.createdAt,
      label: `${m.type === 'ingreso' ? 'Ingreso' : 'Egreso'}: ${m.reason}`,
      amount: m.type === 'ingreso' ? m.amount : -m.amount
    }));
    return [...ventas, ...manuales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [summary.sessionOrders, reg.movimientos]);

  const openDiff = (parseFloat(amount) || 0) - reg.saldoProxima;

  return (
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.5rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-color)' }}>
      {isOpen && (
        <button className="btn-icon" onClick={() => openModal('movement')} title="Ingreso/Egreso de Caja" style={{ background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowsLeftRight weight="bold" />
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
          {isOpen ? `Caja N° ${reg.numero}` : 'Estado Caja'}
        </span>
        <span className={`badge ${isOpen ? 'success' : 'danger'}`}>{reg.status.toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Efvo. en Caja</span>
        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary-color)' }}>
          {formatMoney(isOpen ? summary.efectivoEnCajon : reg.saldoProxima)}
        </span>
      </div>
      <button className="btn-accent" style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }} onClick={() => openModal(isOpen ? 'close' : 'open')}>
        {isOpen ? 'Cerrar / Arqueo' : 'Abrir Caja'}
      </button>

      {modalType !== 'none' && (
        <div className="modal-overlay">
          <div className={`modal-content card${modalType === 'close' ? ' wide' : ''}`}>
            <button className="modal-close-btn" onClick={() => setModalType('none')} aria-label="Cerrar">
              <X weight="bold" />
            </button>
            {modalType === 'close' && (
              <>
                <div className="caja-header">
                  <h2 className="caja-title"><Archive weight="fill" /> Cierre de Caja</h2>
                  <button className="caja-link" onClick={() => setShowMovements(v => !v)}>
                    {showMovements ? 'Ver Resumen' : 'Ver Movimientos'}
                  </button>
                </div>

                {showMovements ? (
                  <div className="caja-box">
                    <div className="caja-box-title"><ArrowsLeftRight weight="bold" /> Movimientos ({movementsList.length})</div>
                    {movementsList.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>No hay movimientos en esta caja.</p>
                    ) : (
                      <MovementsPage list={movementsList} />
                    )}
                  </div>
                ) : (
                  <>
                    <div className="caja-box">
                      <div className="caja-box-title"><Info weight="fill" /> Información de la caja</div>
                      <Row label="Apertura" value={formatOpening(reg.openedAt)} />
                      <Row label="Puesto" value={padNumber(TICKET_CONFIG.puntoVenta, 3)} />
                      <Row label="Caja N°" value={reg.numero} />
                      <Row label="Movimientos" value={summary.cantidadMovimientos} />
                    </div>

                    <div className="caja-box">
                      <div className="caja-box-title"><Coins weight="fill" /> Resumen de caja</div>
                      <Row label="Efectivo inicial" value={formatMoney(reg.efectivoInicial)} />
                      <Row label="Total facturado" value={formatMoney(summary.totalFacturado)} />
                      {PAYMENT_METHODS.map(m => (
                        <Row key={m} muted label={`↳ ${PAYMENT_LABELS[m]}`} value={formatMoney(summary.ventas[m])} />
                      ))}
                      {summary.ingresos > 0 && <Row label="Ingresos manuales" value={`+${formatMoney(summary.ingresos)}`} />}
                      {summary.egresos > 0 && <Row label="Egresos manuales" value={`-${formatMoney(summary.egresos)}`} />}
                      <div className="caja-total">
                        <span>Total en caja</span>
                        <span>{formatMoney(summary.totalEnCaja)}</span>
                      </div>
                      <Row muted label="Efectivo físico en cajón" value={formatMoney(summary.efectivoEnCajon)} />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Money weight="fill" /> Efectivo a dejar (próxima caja)</label>
                      <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" style={{ textAlign: 'right', fontSize: '1.25rem' }} />
                      <p className="caja-hint">Este monto quedará como saldo inicial para la próxima caja.</p>
                    </div>
                  </>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setModalType('none')}>Cancelar</button>
                  <button className="btn-accent btn-danger" onClick={handleConfirmClose}>Confirmar Cierre</button>
                </div>
              </>
            )}
            {modalType === 'open' && (
              <>
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Apertura de Caja N° {reg.numero + 1}</h2>
                {reg.saldoProxima > 0 && (
                  <div className="caja-box">
                    <Row label="Saldo dejado en el último cierre" value={<strong>{formatMoney(reg.saldoProxima)}</strong>} />
                  </div>
                )}
                <div className="form-group">
                  <label>Monto inicial del día (efectivo contado) $</label>
                  <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" autoFocus />
                  <p className="caja-hint">Contá el cambio y todo el efectivo del cajón: con ese dinero arranca la caja.</p>
                  {reg.saldoProxima > 0 && amount.trim() !== '' && openDiff !== 0 && (
                    <p className="caja-hint" style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      Diferencia con el cierre anterior: {openDiff > 0 ? '+' : '-'}{formatMoney(Math.abs(openDiff))}
                    </p>
                  )}
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

export default RegisterModule;
