import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { api } from "@/lib/apiClient";
import type { Profile } from "@/types/database";

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ user: Profile | null }>("/auth?action=me")
      .then((data) => setProfile(data.user))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  async function signInWithPassword(email: string, password: string) {
    try {
      const data = await api.post<{ user: Profile }>("/auth?action=login", { email, password });
      setProfile(data.user);
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      const data = await api.post<{ user: Profile }>("/auth?action=signup", {
        email,
        password,
        fullName,
      });
      setProfile(data.user);
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  }

  async function signOut() {
    await api.post("/auth?action=logout");
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ profile, loading, signInWithPassword, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
