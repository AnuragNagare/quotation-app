import { Badge } from "@/components/ui/badge";
import type { AccountStatus } from "@/types";

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return status === "active" ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="warning">Pending Billing</Badge>
  );
}
