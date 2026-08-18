import { Lock, LockOpen, MoreVertical, PencilLine, History, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientTypeBadge } from "@/components/customers/ClientTypeBadge";
import { AccountStatusBadge } from "@/components/customers/AccountStatusBadge";
import { getInitials, formatINR } from "@/lib/format";
import type { CustomerAccount } from "@/types";

interface CustomersTableProps {
  customers: CustomerAccount[];
  onRowClick: (customer: CustomerAccount) => void;
  onNewQuote: (customer: CustomerAccount) => void;
  onEdit: (customer: CustomerAccount) => void;
  onViewHistory: (customer: CustomerAccount) => void;
  onDelete: (customer: CustomerAccount) => void;
  onToggleLock: (customer: CustomerAccount) => void;
}

export function CustomersTable({
  customers,
  onRowClick,
  onNewQuote,
  onEdit,
  onViewHistory,
  onDelete,
  onToggleLock,
}: CustomersTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-lg font-extrabold text-charcoal">Customer Directory</h2>
        <p className="text-xs font-semibold text-muted">{customers.length} accounts</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-cream-soft text-left text-xs font-semibold text-muted">
              <th className="px-5 py-3 font-semibold">Customer / Hotel</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Key Contact</th>
              <th className="px-5 py-3 font-semibold">Booked Events</th>
              <th className="px-5 py-3 font-semibold">Lifetime Value</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => onRowClick(customer)}
                className="cursor-pointer border-b border-cream-soft transition-colors last:border-0 hover:bg-cream-soft/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-charcoal">{customer.name}</p>
                        {customer.status === "pending_billing" && (
                          <Lock className="size-3.5 text-warning" aria-label="Rate card locked" />
                        )}
                      </div>
                      <p className="text-xs text-muted">{customer.location}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <ClientTypeBadge clientType={customer.clientType} />
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-charcoal-soft">{customer.contactPerson.name}</p>
                  <p className="text-xs text-muted">{customer.contactPerson.phone}</p>
                </td>
                <td className="px-5 py-4 font-semibold text-charcoal-soft">
                  {customer.bookedEvents} Events
                </td>
                <td className="px-5 py-4 font-extrabold text-charcoal">
                  {formatINR(customer.lifetimeValue)}
                </td>
                <td className="px-5 py-4">
                  <AccountStatusBadge status={customer.status} />
                </td>
                <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => onNewQuote(customer)}
                      className="text-xs font-bold text-gold-dark hover:underline"
                    >
                      New Quote
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label="More actions"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-charcoal-soft transition-colors hover:bg-cream-soft hover:text-charcoal"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(customer)}>
                          <PencilLine className="size-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewHistory(customer)}>
                          <History className="size-3.5" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onToggleLock(customer)}>
                          {customer.status === "pending_billing" ? (
                            <LockOpen className="size-3.5" />
                          ) : (
                            <Lock className="size-3.5" />
                          )}
                          {customer.status === "pending_billing"
                            ? "Unlock Rate Card"
                            : "Lock Rate Card"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(customer)}
                          className="text-danger data-[highlighted]:bg-danger-light data-[highlighted]:text-danger"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-muted">
                  No customers match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
