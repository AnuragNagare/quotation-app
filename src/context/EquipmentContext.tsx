import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { equipmentCatalog as initialCatalog } from "@/data/mockData";
import { loadStorage, saveStorage } from "@/lib/storage";
import type { EquipmentCatalogItem } from "@/types";

const STORAGE_KEY = "roxy_equipment_catalog";

interface EquipmentContextValue {
  catalog: EquipmentCatalogItem[];
  addItem: (item: EquipmentCatalogItem) => void;
  updateItem: (id: string, patch: Partial<EquipmentCatalogItem>) => void;
  removeItem: (id: string) => void;
}

const EquipmentContext = createContext<EquipmentContextValue | null>(null);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<EquipmentCatalogItem[]>(() =>
    loadStorage(STORAGE_KEY, initialCatalog)
  );

  useEffect(() => {
    saveStorage(STORAGE_KEY, catalog);
  }, [catalog]);

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
