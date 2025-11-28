import { createContext, useContext, useMemo, useState } from 'react';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
};

export type CartContextState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: number;
  onItemAdded?: (item: CartItem) => void; // hook for admin live activity
  setOnItemAdded: (fn?: (item: CartItem) => void) => void;
};

const CartContext = createContext<CartContextState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [onItemAdded, setOnItemAdded] = useState<((item: CartItem) => void) | undefined>();

  const add = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      let next: CartItem[];
      if (existing) {
        next = prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + item.qty } : p));
      } else {
        next = [...prev, item];
      }
      // notify hook for admin activity
      onItemAdded?.(item);
      return next;
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, add, remove, clear, total, onItemAdded, setOnItemAdded }),
    [items, total, onItemAdded]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
