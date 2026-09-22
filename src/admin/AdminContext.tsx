import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { registerService } from '../services/registerService';
import { Product } from '../types/product';

export interface OrderItem extends Product {
  cartQty?: number;
}

export interface Order {
  id: string;
  client: string;
  total: number;
  neto: number;
  iva: number;
  descuento: number;
  paidEfectivo: number;
  paidTransferencia: number;
  paidTarjeta: number;
  paymentMethod?: 'efectivo' | 'transferencia' | 'tarjeta';
  date: string;
  status: 'pagado';
  items: OrderItem[];
}

export interface RegisterState {
  status: 'abierta' | 'cerrada';
  efectivo: number;
  transferencia: number;
  tarjeta: number;
}

export interface AdminState {
  products: Product[];
  orders: Order[];
  mermas_count: number;
  register: RegisterState;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface OfflineAction {
  type: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'UPDATE_REGISTER' | 'ADD_MERMA' | 'DECREMENT_STOCK' | 'UPDATE_PRODUCT';
  payload: any;
  timestamp: number;
}

interface AdminContextProps {
  state: AdminState;
  isOnline: boolean;
  isSyncing: boolean;
  fetchProducts: () => Promise<void>;
  updateProduct: (id: string | number, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string | number) => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  addMerma: (qty: number) => void;
  createOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
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
  const isSyncingRef = useRef(false); // H-2: ref lock prevents stale closure double-sync

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [state, setState] = useState<AdminState>({
    products: [],
    orders: [],
    mermas_count: 0,
    register: { status: 'cerrada', efectivo: 0, transferencia: 0, tarjeta: 0 }
  });

  // M-9: Catch localStorage quota errors
  const getQueue = (): OfflineAction[] => {
    try {
      const q = localStorage.getItem('terruno_offline_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  };
  const saveQueue = (q: OfflineAction[]) => {
    try {
      localStorage.setItem('terruno_offline_queue', JSON.stringify(q));
    } catch {
      showToast('Almacenamiento local lleno, accion no guardada offline', 'error');
    }
  };
  const pushToQueue = (action: OfflineAction) => {
    const q = getQueue();
    q.push(action);
    saveQueue(q);
  };

  const syncOfflineQueue = async () => {
    const queue = getQueue();
    if (queue.length === 0 || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    let successCount = 0;

    for (const action of queue) {
      try {
        if (action.type === 'CREATE_ORDER') {
          await orderService.createOrder(action.payload);
        } else if (action.type === 'UPDATE_ORDER') {
          await orderService.updateOrder(action.payload.id, action.payload.updates);
        } else if (action.type === 'UPDATE_REGISTER') {
          await registerService.upsertGlobalRegister(action.payload);
        } else if (action.type === 'ADD_MERMA') {
          await productService.addMerma(action.payload.qty);
        } else if (action.type === 'DECREMENT_STOCK') {
          // H-1: Relative decrement via RPC — safe for offline replay
          await productService.decrementStock(action.payload.id, action.payload.qty);
        } else if (action.type === 'UPDATE_PRODUCT') {
          await productService.updateProduct(action.payload.id, action.payload.dbUpdates);
        }
        successCount++;
      } catch (err) {
        console.error('Sync error on action:', action, err);
        break;
      }
    }

    if (successCount > 0) {
      const newQueue = getQueue().slice(successCount);
      saveQueue(newQueue);
      if (newQueue.length === 0) showToast('Sincronizacion completada', 'success');
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

  const loadCloudState = async () => {
    setLoading(true);
    try {
      const [products, orders, register, mermas_count] = await Promise.all([
        productService.getProducts(),
        orderService.getOrders(),
        registerService.getGlobalRegister(),
        productService.getTotalMermas(),
      ]);

      setState({
        products, orders, mermas_count, register
      });

      syncOfflineQueue();
    } catch (e) {
      console.error('Error loading cloud state', e);
    }
    setLoading(false);
  };

  useEffect(() => { loadCloudState(); }, []);

  const fetchProducts = async () => {};

  const executeOrQueue = async (action: OfflineAction, cloudCall: () => Promise<any>) => {
    if (isOnline) {
      try {
        await cloudCall();
      } catch (err) {
        console.error('Cloud call failed, queueing offline', err);
        pushToQueue(action);
      }
    } else {
      pushToQueue(action);
    }
  };

  // M-1 FIX: Only send defined fields — undefined fields become NULL in insforge
  const updateProduct = async (id: string | number, updates: Partial<Product>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.isVisible !== undefined) dbUpdates.is_visible = updates.isVisible;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;

    const action: OfflineAction = { type: 'UPDATE_PRODUCT', payload: { id, dbUpdates }, timestamp: Date.now() };
    await executeOrQueue(action, async () => {
      await productService.updateProduct(id, dbUpdates);
    });
    setState(prev => ({ ...prev, products: prev.products.map(p => p.id == id ? { ...p, ...updates } : p) }));
  };

  const createProduct = async (product: Omit<Product, 'id'>) => {
    const newP = await productService.createProduct(product);
    setState(prev => ({ ...prev, products: [newP, ...prev.products] }));
  };

  const deleteProduct = async (id: string | number) => {
    await productService.deleteProduct(id);
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id.toString()) }));
  };

  const addMerma = (qty: number) => {
    const action: OfflineAction = { type: 'ADD_MERMA', payload: { qty }, timestamp: Date.now() };
    executeOrQueue(action, async () => {
      await productService.addMerma(qty);
    });
    setState(prev => ({ ...prev, mermas_count: prev.mermas_count + qty }));
  };

  const createOrder = (order: Order) => {
    const action: OfflineAction = { type: 'CREATE_ORDER', payload: order, timestamp: Date.now() };
    executeOrQueue(action, async () => {
      await orderService.createOrder(order);
    });
    setState(prev => ({ ...prev, orders: [order, ...prev.orders] }));

    // H-3 FIX: Use functional setState to avoid stale closure
    // H-1 FIX: Use relative RPC decrement — safe for offline replay
    setState(prev => {
      const updatedProducts = prev.products.map(p => {
        const orderItem = order.items.find(i => i.id === p.id);
        if (!orderItem) return p;
        const qty = orderItem.cartQty || 1;
        const decrAction: OfflineAction = { type: 'DECREMENT_STOCK', payload: { id: p.id, qty }, timestamp: Date.now() };
        executeOrQueue(decrAction, async () => {
          await productService.decrementStock(p.id, qty);
        });
        return { ...p, stock: Math.max(0, p.stock - qty) };
      });
      return { ...prev, products: updatedProducts };
    });
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const action: OfflineAction = { type: 'UPDATE_ORDER', payload: { id, updates }, timestamp: Date.now() };
    executeOrQueue(action, async () => {
      await orderService.updateOrder(id, updates);
    });
    setState(prev => ({ ...prev, orders: prev.orders.map(o => o.id === id ? { ...o, ...updates } : o) }));
  };

  const updateRegister = (reg: RegisterState) => {
    const action: OfflineAction = { type: 'UPDATE_REGISTER', payload: reg, timestamp: Date.now() };
    executeOrQueue(action, async () => {
      await registerService.upsertGlobalRegister(reg);
    });
    setState(prev => ({ ...prev, register: reg }));
  };

  const addToCart = (prod: Product) => {
    // H-4: Block adding zero-stock items
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

  // M-5: Remove by product ID, not array index
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <AdminContext.Provider value={{
      state, isOnline, isSyncing, fetchProducts, updateProduct, deleteProduct, createProduct,
      addMerma, createOrder, updateOrder, updateRegister,
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
