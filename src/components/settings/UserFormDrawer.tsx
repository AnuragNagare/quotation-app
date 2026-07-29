import { useEffect, useState } from "react";
import { UserCog } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_META } from "@/components/settings/RoleBadge";
import type { TeamMember, UserRole } from "@/types";

const ROLES: UserRole[] = ["admin", "sales", "operations", "finance"];

interface UserFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMember: TeamMember | null;
  onSave: (member: TeamMember) => void;
}

export function UserFormDrawer({
  open,
  onOpenChange,
  editingMember,
  onSave,
}: UserFormDrawerProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("sales");

  useEffect(() => {
    if (!open) return;
    if (editingMember) {
      setName(editingMember.name);
      setEmail(editingMember.email);
      setPhone(editingMember.phone);
      setRole(editingMember.role);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("sales");
    }
  }, [open, editingMember]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSave({
      id: editingMember?.id ?? `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      status: editingMember?.status ?? "active",
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <UserCog className="size-5" />
          </div>
          <div>
            <SheetTitle>{editingMember ? "Edit User Role" : "Add New User"}</SheetTitle>
            <SheetDescription>
              {editingMember
                ? "Update role and contact details for this team member."
                : "Invite a new team member and assign their role."}
            </SheetDescription>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <SheetBody className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">
                Full Name <span className="text-danger">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Riya Mehta"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">
                Email Address <span className="text-danger">*</span>
              </label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@roxyevents.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">Phone Number</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal-soft">Assigned Role</label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="h-10 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_META[r].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted">
                {role === "admin" && "Full system access — can manage users and all modules."}
                {role === "sales" && "Access to Enquiries, Quotations, and Follow-ups."}
                {role === "operations" && "Access to Events, Dispatches, and Equipment."}
                {role === "finance" && "Access to Invoices and Billing."}
              </p>
            </div>
          </SheetBody>

          <SheetFooter>
            <Button type="submit" size="lg">
              {editingMember ? "Save Changes" : "Add User"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
