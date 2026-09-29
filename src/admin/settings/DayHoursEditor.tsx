import React, { useEffect, useState } from 'react';

const parseHours = (str: string) => {
  if (!str || str.toLowerCase().includes('cerrado')) return { closed: true, open1: '09:00', close1: '13:00', open2: '17:00', close2: '21:00' };
  const matches = str.match(/(\d{2}:\d{2})/g);
  if (matches && matches.length >= 2) {
    return {
      closed: false,
      open1: matches[0],
      close1: matches[1],
      open2: matches[2] || '',
      close2: matches[3] || ''
    };
  }
  return { closed: false, open1: '09:00', close1: '13:00', open2: '17:00', close2: '21:00' };
};

const stringifyHours = (h: any) => {
  if (h.closed) return 'Cerrado';
  let str = `${h.open1} a ${h.close1} hs`;
  if (h.open2 && h.close2) str += ` y ${h.open2} a ${h.close2} hs`;
  return str;
};

export const DayHoursEditor = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
  const [h, setH] = useState(() => parseHours(value || ''));
  
  useEffect(() => {
    setH(parseHours(value || ''));
  }, [value]);

  const update = (newH: any) => {
    setH(newH);
    onChange(stringifyHours(newH));
  };

  return (
    <div className="bg-terruno-bg p-4 rounded-xl border border-terruno-border space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-terruno-brown">{label}</label>
        <label className="flex items-center gap-2 text-sm text-terruno-muted">
          <input type="checkbox" checked={h.closed} onChange={e => update({ ...h, closed: e.target.checked })} className="rounded text-terruno-burgundy" />
          Cerrado
        </label>
      </div>
      {!h.closed && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input type="time" value={h.open1} onChange={e => update({ ...h, open1: e.target.value })} className="w-full p-2 rounded-lg border border-terruno-border text-sm" />
            <span className="text-terruno-muted">a</span>
            <input type="time" value={h.close1} onChange={e => update({ ...h, close1: e.target.value })} className="w-full p-2 rounded-lg border border-terruno-border text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input type="time" value={h.open2} onChange={e => update({ ...h, open2: e.target.value })} className="w-full p-2 rounded-lg border border-terruno-border text-sm" />
            <span className="text-terruno-muted">a</span>
            <input type="time" value={h.close2} onChange={e => update({ ...h, close2: e.target.value })} className="w-full p-2 rounded-lg border border-terruno-border text-sm" />
          </div>
        </div>
      )}
    </div>
  );
};
