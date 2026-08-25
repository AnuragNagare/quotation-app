import { api } from "@/lib/apiClient";
import type { Client } from "@/types/database";

export async function listClients(): Promise<Client[]> {
  const data = await api.get<{ clients: Client[] }>("/clients");
  return data.clients;
}

export async function searchClients(query: string): Promise<Client[]> {
  const data = await api.get<{ clients: Client[] }>(`/clients?q=${encodeURIComponent(query)}`);
  return data.clients;
}

export async function getClientsByIds(ids: string[]): Promise<Map<string, Client>> {
  if (ids.length === 0) return new Map();
  const data = await api.get<{ clients: Client[] }>(
    `/clients?ids=${ids.map(encodeURIComponent).join(",")}`
  );
  return new Map(data.clients.map((c) => [c.id, c]));
}

export async function createClient(input: {
  fullName: string;
  email?: string;
  phone?: string;
}): Promise<Client> {
  const data = await api.post<{ client: Client }>("/clients", input);
  return data.client;
}

export async function updateClient(
  id: string,
  patch: Partial<Pick<Client, "full_name" | "email" | "phone">>
): Promise<Client> {
  const data = await api.patch<{ client: Client }>(`/clients?id=${encodeURIComponent(id)}`, patch);
  return data.client;
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clients?id=${encodeURIComponent(id)}`);
}
