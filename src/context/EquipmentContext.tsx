import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { equipmentCatalog as initialCatalog } from "@/data/mockData";
import type { EquipmentCatalogItem } from "@/types";

interface EquipmentContextValue {
  catalog: EquipmentCatalogItem[];
  addItem: (item: EquipmentCatalogItem) => void;
  updateItem: (id: string, patch: Partial<EquipmentCatalogItem>) => void;
  removeItem: (id: string) => void;
}

const EquipmentContext = createContext<EquipmentContextValue | null>(null);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<EquipmentCatalogItem[]>(initialCatalog);

  function addItem(item: EquipmentCatalogItem) {
    setCatalog((prev) => [item, ...prev]);
  }

  function updateItem(id: string, patch: Partial<EquipmentCatalogItem>) {
    setCatalog((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setCatalog((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <EquipmentContext.Provider value={{ catalog, addItem, updateItem, removeItem }}>
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipmentCatalog() {
  const ctx = useContext(EquipmentContext);
  if (!ctx) {
    throw new Error("useEquipmentCatalog must be used within an EquipmentProvider");
  }
  return ctx;
}
