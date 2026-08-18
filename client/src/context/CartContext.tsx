import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Item } from '../api';

const STORAGE_KEY = 'cart';

interface CartContextValue {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (assetId: string) => void;
  isInCart: (assetId: string) => boolean;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isInCart: () => false,
  clear: () => {},
  total: 0,
});

function loadStoredCart(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(loadStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: Item) {
    setItems((prev) => (prev.some((i) => i.assetId === item.assetId) ? prev : [...prev, item]));
  }

  function removeItem(assetId: string) {
    setItems((prev) => prev.filter((i) => i.assetId !== assetId));
  }

  function isInCart(assetId: string) {
    return items.some((i) => i.assetId === assetId);
  }

  function clear() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + (i.priceUsd ?? 0), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, isInCart, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
