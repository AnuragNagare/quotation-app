import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const CART_STORAGE_KEY = "roxy_cart_v1";

export interface CartLineItem {
  catalogItemId: string;
  companyId: string;
  companyName: string;
  name: string;
  price: number;
  unit: string | null;
  quantity: number;
}

interface CartContextValue {
  items: CartLineItem[];
  addItem: (item: Omit<CartLineItem, "quantity">, quantity?: number) => void;
  updateQuantity: (catalogItemId: string, quantity: number) => void;
  removeItem: (catalogItemId: string) => void;
  clear: () => void;
  totalCount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadInitialCart(): CartLineItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLineItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>(loadInitialCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: Omit<CartLineItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.catalogItemId === item.catalogItemId);
      if (existing) {
        return prev.map((i) =>
          i.catalogItemId === item.catalogItemId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function updateQuantity(catalogItemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(catalogItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.catalogItemId === catalogItemId ? { ...i, quantity } : i))
    );
  }

  function removeItem(catalogItemId: string) {
    setItems((prev) => prev.filter((i) => i.catalogItemId !== catalogItemId));
  }

  function clear() {
    setItems([]);
  }

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clear, totalCount, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
