import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomersHeaderProps {
  onExportContacts: () => void;
  onAddCustomer: () => void;
}

export function CustomersHeader({ onExportContacts, onAddCustomer }: CustomersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
          Customers & Hotel Partners
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage client relationships, contact profiles, and billing configurations.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={onExportContacts}>
          <Download className="size-4" />
          Export Contacts
        </Button>
        <Button size="lg" onClick={onAddCustomer}>
          <Plus className="size-4" />
          Add New Customer
        </Button>
      </div>
    </div>
  );
}
