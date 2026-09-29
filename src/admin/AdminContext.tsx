import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { registerService } from '../services/registerService';
import { Product } from '../types/product';
import { AdminState, EMPTY_REGISTER, Order, OrderItem, RegisterState } from './types';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

type OfflineActionType = 'CREATE_ORDER' | 'UPDATE_ORDER' | 'UPDATE_REGISTER' | 'DECREMENT_STOCK' | 'UPDATE_PRODUCT';

interface OfflineAction {
  type: OfflineActionType;
  payload: any;
  timestamp: number;
}

const QUEUE_KEY = 'terruno_offline_queue';

// Cada acción encolada se reproduce contra la nube con el mismo handler que la ejecuta online
const cloudHandlers: Record<OfflineActionType, (payload: any) => Promise<void>> = {
  CREATE_ORDER: (order) => orderService.createOrder(order),
  UPDATE_ORDER: ({ id, updates }) => orderService.updateOrder(id, updates),
  UPDATE_REGISTER: (reg) => registerService.upsertGlobalRegister(reg),
  DECREMENT_STOCK: ({ id, qty }) => productService.decrementStock(id, qty),
  UPDATE_PRODUCT: ({ id, dbUpdates }) => productService.updateProduct(id, dbUpdates),
};

interface AdminContextProps {
  state: AdminState;
  isOnline: boolean;
  isSyncing: boolean;
  updateProduct: (id: string | number, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string | number) => Promise<void>;
  createOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Pick<Order, 'paymentMethod' | 'observacion'>>) => void;
  cancelOrder: (id: string, observacion: string) => void;
  updateRegister: (reg: RegisterState) => void;
  cart: OrderItem[];
  addToCart: (prod: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  loading: boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);
  const [state, setState] = useState<AdminState>({ products: [], orders: [], register: EMPTY_REGISTER });

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const getQueue = (): OfflineAction[] => {
    try {
      const q = localStorage.getItem(QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  };

  const saveQueue = (q: OfflineAction[]) => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch {
      showToast('Almacenamiento local lleno, accion no guardada offline', 'error');
    }
  };

  const syncOfflineQueue = async () => {
    const queue = getQueue();
    if (queue.length === 0 || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    let successCount = 0;

    for (const action of queue) {
      try {
        // Las acciones de versiones anteriores sin handler se descartan
        await cloudHandlers[action.type]?.(action.payload);
        successCount++;
      } catch (err) {
        console.error('Sync error on action:', action, err);
        break;
      }
    }

    if (successCount > 0) {
      const remaining = getQueue().slice(successCount);
      saveQueue(remaining);
      if (remaining.length === 0) showToast('Sincronizacion completada', 'success');
    }
    isSyncingRef.current = false;
    setIsSyncing(false);
  };

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncOfflineQueue(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [products, orders, register] = await Promise.all([
          productService.getProducts(),
          orderService.getOrders(),
          registerService.getGlobalRegister(),
        ]);
        setState({ products, orders, register });
        syncOfflineQueue();
      } catch (e) {
        console.error('Error loading cloud state', e);
      }
      setLoading(false);
    })();
  }, []);

  const runOrQueue = async (type: OfflineActionType, payload: any) => {
    if (isOnline) {
      try {
        await cloudHandlers[type](payload);
        return;
      } catch (err) {
        console.error('Cloud call failed, queueing offline', err);
      }
    }
    const queue = getQueue();
    queue.push({ type, payload, timestamp: Date.now() });
    saveQueue(queue);
  };

  const adjustLocalStock = (items: OrderItem[], direction: 1 | -1) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => {
        const item = items.find(i => i.id === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - direction * (item.cartQty || 1)) } : p;
      })
    }));
    items.forEach(item => runOrQueue('DECREMENT_STOCK', { id: item.id, qty: direction * (item.cartQty || 1) }));
  };

  const updateProduct = async (id: string | number, updates: Partial<Product>) => {
    // Solo se envían los campos definidos: undefined se guardaría como NULL
    const dbUpdates: Record<string, any> = {};
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.isVisible !== undefined) dbUpdates.is_visible = updates.isVisible;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;

    await runOrQueue('UPDATE_PRODUCT', { id, dbUpdates });
    setState(prev => ({ ...prev, products: prev.products.map(p => p.id == id ? { ...p, ...updates } : p) }));
  };

  const deleteProduct = async (id: string | number) => {
    await productService.deleteProduct(id);
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id.toString()) }));
  };

  const createOrder = (order: Order) => {
    runOrQueue('CREATE_ORDER', order);
    setState(prev => ({ ...prev, orders: [order, ...prev.orders] }));
    adjustLocalStock(order.items, 1);
  };

  const updateOrderLocal = (id: string, updates: Partial<Order>) => {
    setState(prev => ({ ...prev, orders: prev.orders.map(o => o.id === id ? { ...o, ...updates } : o) }));
  };

  const updateOrder = (id: string, updates: Partial<Pick<Order, 'paymentMethod' | 'observacion'>>) => {
    runOrQueue('UPDATE_ORDER', { id, updates });
    updateOrderLocal(id, updates);
  };

  const cancelOrder = (id: string, observacion: string) => {
    const order = state.orders.find(o => o.id === id);
    if (!order || order.status === 'anulada') return;
    const updates = { status: 'anulada' as const, observacion };
    runOrQueue('UPDATE_ORDER', { id, updates });
    updateOrderLocal(id, updates);
    adjustLocalStock(order.items, -1);
  };

  const updateRegister = (reg: RegisterState) => {
    runOrQueue('UPDATE_REGISTER', reg);
    setState(prev => ({ ...prev, register: reg }));
  };

  const addToCart = (prod: Product) => {
    const currentStock = state.products.find(p => p.id === prod.id)?.stock ?? 0;
    const alreadyInCart = cart.find(p => p.id === prod.id)?.cartQty ?? 0;
    if (currentStock - alreadyInCart <= 0) {
      showToast('Stock insuficiente para este producto', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(p => p.id === prod.id);
      if (existing) return prev.map(p => p.id === prod.id ? { ...p, cartQty: (p.cartQty || 1) + 1 } : p);
      return [...prev, { ...prod, cartQty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(p => p.id !== productId));

  const clearCart = () => setCart([]);

  return (
    <AdminContext.Provider value={{
      state, isOnline, isSyncing, updateProduct, deleteProduct,
      createOrder, updateOrder, cancelOrder, updateRegister,
      cart, addToCart, removeFromCart, clearCart, loading,
      toasts, showToast
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
