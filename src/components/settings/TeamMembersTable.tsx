import { KeyRound, MoreVertical, PencilLine, Plus, UserX2, UserCheck2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/settings/RoleBadge";
import { UserStatusBadge } from "@/components/settings/UserStatusBadge";
import { getInitials } from "@/lib/format";
import type { TeamMember } from "@/types";

interface TeamMembersTableProps {
  members: TeamMember[];
  onAddUser: () => void;
  onEditRole: (member: TeamMember) => void;
  onResetPassword: (member: TeamMember) => void;
  onToggleStatus: (member: TeamMember) => void;
}

export function TeamMembersTable({
  members,
  onAddUser,
  onEditRole,
  onResetPassword,
  onToggleStatus,
}: TeamMembersTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-charcoal">Team Members & Access Control</h2>
          <p className="text-xs font-semibold text-muted">{members.length} accounts</p>
        </div>
        <button
          onClick={onAddUser}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gold px-3.5 py-2 text-sm font-semibold text-gold-dark transition-colors hover:bg-gold-light"
        >
          <Plus className="size-4" />
          Add New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-cream-soft text-left text-xs font-semibold text-muted">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Email & Phone</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b border-cream-soft transition-colors last:border-0 hover:bg-cream-soft/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-charcoal">{member.name}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-charcoal-soft">{member.email}</p>
                  <p className="text-xs text-muted">{member.phone}</p>
                </td>
                <td className="px-5 py-4">
                  <RoleBadge role={member.role} />
                </td>
                <td className="px-5 py-4">
                  <UserStatusBadge status={member.status} />
                </td>
                <td className="px-5 py-4 text-right">
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
                      <DropdownMenuItem onClick={() => onEditRole(member)}>
                        <PencilLine className="size-3.5" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onResetPassword(member)}>
                        <KeyRound className="size-3.5" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(member)}
                        className={
                          member.status === "active"
                            ? "text-danger data-[highlighted]:bg-danger-light data-[highlighted]:text-danger"
                            : "text-success data-[highlighted]:bg-success-light data-[highlighted]:text-success"
                        }
                      >
                        {member.status === "active" ? (
                          <UserX2 className="size-3.5" />
                        ) : (
                          <UserCheck2 className="size-3.5" />
                        )}
                        {member.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}

            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-muted">
                  No team members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
