import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [onItemAdded, setOnItemAdded] = useState(undefined);

  const add = (item) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      let next;
      if (existing) {
        next = prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + item.qty } : p));
      } else {
        next = [...prev, item];
      }
      // notify hook for admin activity
      if (onItemAdded) {
        onItemAdded(item);
      }
      return next;
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
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