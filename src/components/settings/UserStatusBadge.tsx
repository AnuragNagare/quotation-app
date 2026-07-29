import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/types";

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return status === "active" ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="default">Inactive</Badge>
  );
}
