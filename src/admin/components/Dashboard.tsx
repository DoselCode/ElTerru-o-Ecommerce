import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { PAYMENT_LABELS, PAYMENT_METHODS, formatMoney, sumByMethod, toLocalDateString } from '../utils/posUtils';

type Period = 'daily' | 'weekly' | 'monthly';

const getPeriodStart = (period: Period, now: Date) => {
  if (period === 'daily') return toLocalDateString(now);
  if (period === 'weekly') return toLocalDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()));
  return toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
};

/** Resumen de lo cobrado por método de pago en el día, semana o mes en curso. */
export const Dashboard: React.FC = () => {
  const { state } = useAdmin();
  const [period, setPeriod] = useState<Period>('daily');

  const byMethod = useMemo(() => {
    const now = new Date();
    const from = getPeriodStart(period, now);
    const to = toLocalDateString(now);
    return sumByMethod(state.orders.filter(o => o.date >= from && o.date <= to));
  }, [state.orders, period]);

  const cobrado = PAYMENT_METHODS.reduce((acc, m) => acc + byMethod[m], 0);

  return (
    <section className="view-section active flex-col">
      <div className="section-header">
        <h2 className="section-title" style={{ margin: 0 }}>Resumen General</h2>
        <select className="period-select" value={period} onChange={e => setPeriod(e.target.value as Period)}>
          <option value="daily">Hoy</option>
          <option value="weekly">Esta Semana</option>
          <option value="monthly">Este Mes</option>
        </select>
      </div>

      <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card">
          <h3 className="card-subtitle">Total Cobrado</h3>
          <p className="card-value text-success">{formatMoney(cobrado)}</p>
        </div>
        {PAYMENT_METHODS.map(m => (
          <div className="card" key={m}>
            <h3 className="card-subtitle">{PAYMENT_LABELS[m]}</h3>
            <p className="card-value">{formatMoney(byMethod[m])}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Dashboard;
