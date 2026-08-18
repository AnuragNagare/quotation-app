import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/format";
import { loadStorage, saveStorage } from "@/lib/storage";
import type { Expense } from "@/types";

const STORAGE_KEY = "roxy_expenses_list";

const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    eventName: "Wedding - John & Sara",
    linkedQuoteId: "QT-1023",
    category: "Logistics & Transport",
    amount: 8500,
    spentBy: "Mahesh Kamble (Driver)",
    date: "18 May 2026",
    notes: "Vehicle diesel + toll charges for Bandra Taj Lands End.",
  },
  {
    id: "exp-2",
    eventName: "Tech Innovation Summit",
    linkedQuoteId: "QT-1015",
    category: "Crew Allowance",
    amount: 6000,
    spentBy: "Arjun Patel",
    date: "12 May 2026",
    notes: "Overtime food allowance for 4 technicians at JW Marriott.",
  },
  {
    id: "exp-3",
    eventName: "Healthcare Leadership Forum",
    linkedQuoteId: "QT-1019",
    category: "Dry Hire Rental",
    amount: 14000,
    spentBy: "Riya Mehta",
    date: "15 May 2026",
    notes: "Sub-rented 2x moving head lights from SoundKraft Mumbai.",
  },
];

interface ExpenseTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseTrackerModal({ open, onOpenChange }: ExpenseTrackerModalProps) {
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadStorage(STORAGE_KEY, initialExpenses)
  );

  useEffect(() => {
    saveStorage(STORAGE_KEY, expenses);
  }, [expenses]);

  // Form state
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("Logistics & Transport");
  const [amount, setAmount] = useState("");
  const [spentBy, setSpentBy] = useState("");
  const [notes, setNotes] = useState("");

  const totalExpense = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!eventName || !amount) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      eventName,
      category,
      amount: Number(amount),
      spentBy: spentBy || "Staff",
      date: "Today",
      notes,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setEventName("");
    setAmount("");
    setSpentBy("");
    setNotes("");
  }

  function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
              <Wallet className="size-5" />
            </div>
            <div>
              <DialogTitle>Expense &amp; Cost Tracker</DialogTitle>
              <DialogDescription>
                Log operational expenses (transport, crew, dry hire) against bookings to track net profit.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Total Summary */}
        <div className="flex items-center justify-between rounded-2xl bg-cream-soft p-4">
          <div>
            <p className="text-xs font-semibold text-muted">Total Logged Expenses</p>
            <p className="text-xl font-extrabold text-charcoal">{formatINR(totalExpense)}</p>
          </div>
          <Badge variant="warning">{expenses.length} Records</Badge>
        </div>

        {/* Add Expense Form */}
        <form onSubmit={handleAddExpense} className="rounded-2xl border border-cream-deep p-4 space-y-3">
          <p className="text-xs font-bold uppercase text-charcoal">Log New Expense</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-[11px] font-semibold text-muted">Event / Booking</label>
              <Input
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Wedding - John & Sara"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted">Category</label>
              <Select value={category} onValueChange={(val) => setCategory(val as Expense["category"])}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Logistics & Transport">Logistics &amp; Transport</SelectItem>
                  <SelectItem value="Crew Allowance">Crew Allowance</SelectItem>
                  <SelectItem value="Dry Hire Rental">Dry Hire Rental</SelectItem>
                  <SelectItem value="Venue Fee">Venue Fee</SelectItem>
                  <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted">Amount (₹)</label>
              <Input
                required
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="h-9 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-muted">Spent By / Paid To</label>
              <Input
                value={spentBy}
                onChange={(e) => setSpentBy(e.target.value)}
                placeholder="e.g. Arjun Patel / Fuel Station"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted">Notes / Details</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Diesel toll charges"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <Button type="submit" size="sm" className="w-full sm:w-auto">
            <Plus className="size-4" />
            Add Expense Record
          </Button>
        </form>

        {/* Expenses List Table */}
        <div className="overflow-x-auto rounded-xl border border-cream-soft">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-cream-soft bg-cream-soft/40 text-left font-semibold text-muted">
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Spent By</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="border-b border-cream-soft last:border-0 hover:bg-cream-soft/20">
                  <td className="px-3 py-2.5 font-bold text-charcoal">
                    {exp.eventName}
                    {exp.notes && <p className="text-[10px] font-normal text-muted">{exp.notes}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-charcoal-soft">{exp.category}</td>
                  <td className="px-3 py-2.5 text-charcoal-soft">{exp.spentBy}</td>
                  <td className="px-3 py-2.5 text-muted">{exp.date}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-danger">{formatINR(exp.amount)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-1 text-muted hover:text-danger"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No expenses logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
