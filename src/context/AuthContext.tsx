import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabaseClient";
import type { Profile, Role } from "@/types/database";

interface SignUpResult {
  error: string | null;
  needsEmailConfirmation: boolean;
  session: Session | null;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpBusinessUser: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<SignUpResult>;
  signUpClient: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Ensures a roxy_profiles row exists for the signed-in user. Falls back to the
// `pending_role`/`pending_full_name` signup hints stored in auth user_metadata
// (onboarding convenience only — never used for authorization; the profile's
// `role` column, guarded by RLS to 'client' | 'business_user', is the source
// of truth once inserted).
async function ensureProfile(session: Session): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from("roxy_profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (existing) return existing;

  const meta = session.user.user_metadata as {
    pending_role?: Role;
    pending_full_name?: string;
  };
  const role: Role = meta.pending_role === "business_user" ? "business_user" : "client";

  const { data: inserted, error } = await supabase
    .from("roxy_profiles")
    .insert({
      id: session.user.id,
      role,
      full_name: meta.pending_full_name ?? "",
      email: session.user.email ?? null,
    })
    .select("*")
    .single();

  if (error) {
    // A concurrent call (e.g. the manual post-signup insert racing the
    // onAuthStateChange-triggered one) may have created the row first —
    // re-fetch instead of leaving the caller with a null profile.
    const { data: fallback } = await supabase
      .from("roxy_profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    if (fallback) return fallback;
    console.error("Failed to create profile:", error.message);
    return null;
  }
  return inserted;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        const p = await ensureProfile(data.session);
        if (!active) return;
        setProfile(p);
      }
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        ensureProfile(nextSession).then((p) => active && setProfile(p));
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUpAs(role: "business_user" | "client", email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { pending_role: role, pending_full_name: fullName } },
    });
    if (error) return { error: error.message, needsEmailConfirmation: false, session: null };
    if (data.session) {
      const p = await ensureProfile(data.session);
      setProfile(p);
      setSession(data.session);
    }
    return { error: null, needsEmailConfirmation: !data.session, session: data.session };
  }

  function signUpBusinessUser(email: string, password: string, fullName: string) {
    return signUpAs("business_user", email, password, fullName);
  }

  function signUpClient(email: string, password: string, fullName: string) {
    return signUpAs("client", email, password, fullName);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signInWithPassword,
        signUpBusinessUser,
        signUpClient,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
