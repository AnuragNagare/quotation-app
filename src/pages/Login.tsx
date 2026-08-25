import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

type Mode = "sign-in" | "sign-up";

export function Login() {
  const navigate = useNavigate();
  const { signInWithPassword, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === "sign-in") {
      const { error } = await signInWithPassword(email, password);
      setSubmitting(false);
      if (error) {
        setError(error);
        return;
      }
      navigate("/");
      return;
    }

    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/");
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-soft-lg">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gold text-white shadow-soft">
            <span className="text-xl font-extrabold">EQ</span>
          </div>
          <div>
            <p className="text-xl font-extrabold text-charcoal">Enquiry to Quotation</p>
            <p className="text-xs font-medium text-muted">
              {mode === "sign-in" ? "Sign in to the admin console" : "Create an admin account"}
            </p>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}
        {info && (
          <p className="mb-4 rounded-lg bg-success-light px-3 py-2 text-xs font-semibold text-success">
            {info}
          </p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {mode === "sign-up" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            setError(null);
            setInfo(null);
          }}
          className="mt-4 w-full text-center text-xs font-semibold text-muted hover:text-charcoal"
        >
          {mode === "sign-in"
            ? "New here? Create an admin account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
