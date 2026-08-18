import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { customerAccounts as initialAccounts } from "@/data/mockData";
import { loadStorage, saveStorage } from "@/lib/storage";
import type { BillingCycle, BillingFormat, CustomerAccount } from "@/types";

const STORAGE_KEY = "roxy_customer_accounts";

interface CustomerContextValue {
  customers: CustomerAccount[];
  addCustomer: (customer: CustomerAccount) => void;
  updateCustomer: (id: string, patch: Partial<CustomerAccount>) => void;
  removeCustomer: (id: string) => void;
  updateBilling: (id: string, format: BillingFormat, cycle: BillingCycle) => void;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<CustomerAccount[]>(() =>
    loadStorage(STORAGE_KEY, initialAccounts)
  );

  useEffect(() => {
    saveStorage(STORAGE_KEY, customers);
  }, [customers]);

  function addCustomer(customer: CustomerAccount) {
    setCustomers((prev) => [customer, ...prev]);
  }

  function updateCustomer(id: string, patch: Partial<CustomerAccount>) {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === id ? { ...customer, ...patch } : customer))
    );
  }

  function removeCustomer(id: string) {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
  }

  function updateBilling(id: string, format: BillingFormat, cycle: BillingCycle) {
    updateCustomer(id, { billingFormat: format, billingCycle: cycle });
  }

  return (
    <CustomerContext.Provider
      value={{ customers, addCustomer, updateCustomer, removeCustomer, updateBilling }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return ctx;
}
