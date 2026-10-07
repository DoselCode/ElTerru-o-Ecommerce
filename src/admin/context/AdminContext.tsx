import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { registerService } from '../../services/registerService';
import { Product } from '../../types/product';
import { AdminState, EMPTY_REGISTER, Order, OrderItem, RegisterState } from '../types';
import { useToast } from './ToastContext';

type OrderUpdates = Partial<Pick<Order, 'paymentMethod' | 'status' | 'observacion'>>;

interface UpdateOrderPayload { id: string; updates: OrderUpdates }
interface DecrementStockPayload { id: string | number; qty: number }
interface UpdateProductPayload { id: string | number; dbUpdates: Record<string, unknown> }

interface OfflinePayloads {
  CREATE_ORDER: Order;
  UPDATE_ORDER: UpdateOrderPayload;
  UPDATE_REGISTER: RegisterState;
  DECREMENT_STOCK: DecrementStockPayload;
  UPDATE_PRODUCT: UpdateProductPayload;
}

type OfflineActionType = keyof OfflinePayloads;

type OfflineAction = {
  [K in OfflineActionType]: { type: K; payload: OfflinePayloads[K]; timestamp: number };
}[OfflineActionType];

const QUEUE_KEY = 'terruno_offline_queue';

type CloudHandlers = { [K in OfflineActionType]: (payload: OfflinePayloads[K]) => Promise<void> };

// Cada acción encolada se reproduce contra la nube con el mismo handler que la ejecuta online
const cloudHandlers: CloudHandlers = {
  CREATE_ORDER: (order) => orderService.createOrder(order),
  UPDATE_ORDER: ({ id, updates }) => orderService.updateOrder(id, updates),
  UPDATE_REGISTER: (reg) => registerService.upsertGlobalRegister(reg),
  DECREMENT_STOCK: ({ id, qty }) => productService.decrementStock(id, qty),
  UPDATE_PRODUCT: ({ id, dbUpdates }) => productService.updateProduct(id, dbUpdates),
};

// The queue is persisted, so its entries may come from older versions with unknown types.
const replayAction = (action: OfflineAction): Promise<void> | undefined => {
  const handler = cloudHandlers[action.type] as ((payload: unknown) => Promise<void>) | undefined;
  return handler?.(action.payload);
};
interface AdminContextProps {
  state: AdminState;
  isOnline: boolean;
  isSyncing: boolean;
  updateProduct: (id: string | number, updates: Partial<Product>) => Promise<void>;
  updateProductLocal: (id: string | number, updates: Partial<Product>) => void;
  deleteProduct: (id: string | number) => Promise<void>;
  refreshProducts: () => Promise<void>;
  createOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Pick<Order, 'paymentMethod' | 'observacion'>>) => void;
  cancelOrder: (id: string, observacion: string) => void;
  updateRegister: (reg: RegisterState) => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

/** Estado global del admin (productos, ventas, caja). Offline-first: las escrituras que fallan se encolan en localStorage y se reenvían al reconectar. */
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);
  const [state, setState] = useState<AdminState>({ products: [], orders: [], register: EMPTY_REGISTER });

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
        await replayAction(action);
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

  const runOrQueue = async <K extends OfflineActionType>(type: K, payload: OfflinePayloads[K]) => {
    if (isOnline) {
      try {
        await (cloudHandlers[type] as (p: OfflinePayloads[K]) => Promise<void>)(payload);
        return;
      } catch (err) {
        console.error('Cloud call failed, queueing offline', err);
      }
    }
    const queue = getQueue();
    queue.push({ type, payload, timestamp: Date.now() } as OfflineAction);
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
    const dbUpdates: Record<string, unknown> = {};
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id;
    if (updates.provider_id !== undefined) dbUpdates.provider_id = updates.provider_id;
    if (updates.isVisible !== undefined) dbUpdates.is_visible = updates.isVisible;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;

    await runOrQueue('UPDATE_PRODUCT', { id, dbUpdates });
    setState(prev => ({ ...prev, products: prev.products.map(p => p.id == id ? { ...p, ...updates } : p) }));
  };

  const updateProductLocal = (id: string | number, updates: Partial<Product>) => {
    setState(prev => ({ ...prev, products: prev.products.map(p => p.id == id ? { ...p, ...updates } : p) }));
  };

  const deleteProduct = async (id: string | number) => {
    await productService.deleteProduct(id);
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id.toString()) }));
  };

  const refreshProducts = async () => {
    const products = await productService.getProducts();
    setState(prev => ({ ...prev, products }));
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

  return (
    <AdminContext.Provider value={{
      state, isOnline, isSyncing, updateProduct, updateProductLocal, deleteProduct, refreshProducts,
      createOrder, updateOrder, cancelOrder, updateRegister,
      loading
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
