import React, { useState, useMemo } from 'react';
import { useAdmin } from './AdminContext';

export const Dashboard: React.FC = () => {
  const { state } = useAdmin();
  const [period, setPeriod] = useState<'daily'|'weekly'|'monthly'>('daily');

  const { cobrado, efectivo, transferencia, tarjeta } = useMemo(() => {
    const now = new Date();
    // Use local time zone string safely
    const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    // For weekly, get start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfWeekStr = new Date(startOfWeek.getTime() - (startOfWeek.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    // For monthly, get start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = new Date(startOfMonth.getTime() - (startOfMonth.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const filtered = state.orders.filter(o => {
      if (period === 'daily') return o.date === todayStr;
      if (period === 'weekly') return o.date >= startOfWeekStr && o.date <= todayStr;
      if (period === 'monthly') return o.date >= startOfMonthStr && o.date <= todayStr;
      return false;
    });

    let efe = 0;
    let trans = 0;
    let tarj = 0;
    filtered.forEach(o => {
      efe += (o.paidEfectivo || 0);
      trans += (o.paidTransferencia || 0);
      tarj += (o.paidTarjeta || 0);
    });
    
    return { cobrado: efe + trans + tarj, efectivo: efe, transferencia: trans, tarjeta: tarj };
  }, [state.orders, period]);

  return (
    <section className="view-section active flex-col">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Resumen General</h2>
        <select 
          value={period} 
          onChange={e => setPeriod(e.target.value as any)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
        >
          <option value="daily">Hoy</option>
          <option value="weekly">Esta Semana</option>
          <option value="monthly">Este Mes</option>
        </select>
      </div>

      <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card">
          <h3 className="card-subtitle">Total Cobrado</h3>
          <p className="card-value text-success">${cobrado.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3 className="card-subtitle">Efectivo</h3>
          <p className="card-value">${efectivo.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3 className="card-subtitle">Transferencia</h3>
          <p className="card-value">${transferencia.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3 className="card-subtitle">Tarjeta/Digital</h3>
          <p className="card-value">${tarjeta.toLocaleString()}</p>
        </div>
        <div className="card dark-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="card-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>Reducciones Totales</h3>
          <p className="card-value">{state.mermas_count} un.</p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
