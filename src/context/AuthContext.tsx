import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { api } from "@/lib/apiClient";
import type { Profile } from "@/types/database";

interface SignUpResult {
  error: string | null;
  profile: Profile | null;
}

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpBusinessUser: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signUpClient: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
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

  async function signUpAs(
    role: "business_user" | "client",
    email: string,
    password: string,
    fullName: string
  ): Promise<SignUpResult> {
    try {
      const data = await api.post<{ user: Profile }>("/auth?action=signup", {
        email,
        password,
        fullName,
        role,
      });
      setProfile(data.user);
      return { error: null, profile: data.user };
    } catch (err) {
      return { error: (err as Error).message, profile: null };
    }
  }

  function signUpBusinessUser(email: string, password: string, fullName: string) {
    return signUpAs("business_user", email, password, fullName);
  }

  function signUpClient(email: string, password: string, fullName: string) {
    return signUpAs("client", email, password, fullName);
  }

  async function signOut() {
    await api.post("/auth?action=logout");
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ profile, loading, signInWithPassword, signUpBusinessUser, signUpClient, signOut }}
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
