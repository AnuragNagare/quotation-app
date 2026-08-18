import { Download, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoicesHeaderProps {
  onExportReport: () => void;
  onCreateInvoice: () => void;
  onOpenExpenses: () => void;
}

export function InvoicesHeader({
  onExportReport,
  onCreateInvoice,
  onOpenExpenses,
}: InvoicesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
          Invoicing &amp; Billing Portal
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage daily client billing, event expenses, and automated monthly hotel billing cycles.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={onOpenExpenses}>
          <Wallet className="size-4 text-gold-dark" />
          Expenses
        </Button>
        <Button variant="secondary" onClick={onExportReport}>
          <Download className="size-4" />
          Export Report
        </Button>
        <Button size="lg" onClick={onCreateInvoice}>
          <Plus className="size-4" />
          Create Invoice
        </Button>
      </div>
    </div>
  );
}
