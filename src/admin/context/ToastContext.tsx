import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
  action?: ToastAction;
}

export interface ToastOptions {
  action?: ToastAction;
  duration?: number;
}

type ShowToast = (message: string, type?: ToastMessage['type'], options?: ToastOptions) => void;

// Two contexts on purpose: components that only fire toasts get a stable
// `showToast` and never re-render when the toast list changes.
const ToastActionsContext = createContext<ShowToast | undefined>(undefined);
const ToastListContext = createContext<ToastMessage[] | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const showToast = useCallback<ShowToast>((message, type = 'success', options) => {
    const id = Date.now() + Math.random();
    const action = options?.action && {
      label: options.action.label,
      onClick: () => { options.action?.onClick(); dismissToast(id); },
    };
    setToasts(prev => [...prev, { id, message, type, action }]);
    setTimeout(() => dismissToast(id), options?.duration ?? 4000);
  }, [dismissToast]);

  const actions = useMemo(() => showToast, [showToast]);

  return (
    <ToastActionsContext.Provider value={actions}>
      <ToastListContext.Provider value={toasts}>{children}</ToastListContext.Provider>
    </ToastActionsContext.Provider>
  );
};

export const useToast = () => {
  const showToast = useContext(ToastActionsContext);
  if (!showToast) throw new Error('useToast must be used within ToastProvider');
  return { showToast };
};

export const useToasts = () => {
  const toasts = useContext(ToastListContext);
  if (!toasts) throw new Error('useToasts must be used within ToastProvider');
  return toasts;
};