import { Badge } from "@/components/ui/badge";
import type { ClientType } from "@/types";

export function ClientTypeBadge({ clientType }: { clientType: ClientType }) {
  return clientType === "hotel" ? (
    <Badge variant="purple">Hotel Partner</Badge>
  ) : (
    <Badge variant="info">Direct Client</Badge>
  );
}
