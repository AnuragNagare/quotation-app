import { api } from "@/lib/apiClient";
import type { Profile } from "@/types/database";

export async function searchClients(query: string): Promise<Profile[]> {
  const data = await api.get<{ clients: Profile[] }>(
    `/clients?q=${encodeURIComponent(query)}`
  );
  return data.clients;
}

export async function getClientsByIds(ids: string[]): Promise<Map<string, Profile>> {
  if (ids.length === 0) return new Map();
  const data = await api.get<{ clients: Profile[] }>(
    `/clients?ids=${ids.map(encodeURIComponent).join(",")}`
  );
  return new Map(data.clients.map((p) => [p.id, p]));
}
