import { supabase } from "@/lib/supabaseClient";
import type { Enquiry, Profile, Quote } from "@/types/database";

// Admin write actions (update/delete on someone else's profile, delete on any
// enquiry/quote) are enforced server-side by RLS (profiles_update_admin,
// profiles_delete_admin, enquiries_delete_admin, quotes_delete_admin) — these
// calls only succeed for a caller whose roxy_profiles.role = 'admin'.

export async function listProfilesByRole(role: "client" | "business_user"): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("roxy_profiles")
    .select("*")
    .eq("role", role)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateProfile(
  id: string,
  patch: Partial<Pick<Profile, "full_name" | "phone" | "email">>
): Promise<Profile> {
  const { data, error } = await supabase
    .from("roxy_profiles")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function adminDeleteProfile(id: string): Promise<void> {
  const { error } = await supabase.from("roxy_profiles").delete().eq("id", id);
  if (error) throw error;
}

export async function listAllEnquiriesAdmin(): Promise<Enquiry[]> {
  const { data, error } = await supabase
    .from("roxy_enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminDeleteEnquiry(id: string): Promise<void> {
  const { error } = await supabase.from("roxy_enquiries").delete().eq("id", id);
  if (error) throw error;
}

export async function listAllQuotesAdmin(): Promise<Quote[]> {
  const { data, error } = await supabase
    .from("roxy_quotes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminDeleteQuote(id: string): Promise<void> {
  const { error } = await supabase.from("roxy_quotes").delete().eq("id", id);
  if (error) throw error;
}
