import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createEnquiry } from "@/lib/enquiries";
import { formatINR } from "@/lib/format";

export function Checkout() {
  const navigate = useNavigate();
  const { profile, signUpClient } = useAuth();
  const { items, totalAmount, clear } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // A submit clears the cart as part of success, which would otherwise re-trigger
  // this "cart is empty, bounce to /cart" guard and override the intended
  // /my-enquiries redirect — this ref distinguishes that case from someone
  // navigating to /checkout directly with nothing in their cart.
  const justSubmittedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !justSubmittedRef.current) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  async function submitEnquiry() {
    await createEnquiry(
      items.map((i) => ({
        catalogItemId: i.catalogItemId,
        companyId: i.companyId,
        quantity: i.quantity,
      })),
      notes.trim() || undefined
    );
    justSubmittedRef.current = true;
    clear();
    navigate("/my-enquiries");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (profile) {
        await submitEnquiry();
        return;
      }

      const { error } = await signUpClient(email, password, fullName);
      if (error) {
        setError(error);
        return;
      }
      await submitEnquiry();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
          {profile ? "Confirm Your Enquiry" : "Create Your Account & Submit"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {items.length} item{items.length !== 1 ? "s" : ""} · Estimated total{" "}
          <span className="font-bold text-charcoal">{formatINR(totalAmount)}</span>
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <form
        className="flex flex-col gap-4 rounded-card border border-black/[0.03] bg-white p-6 shadow-soft"
        onSubmit={handleSubmit}
      >
        {!profile && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
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
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
            Notes for this enquiry (optional)
          </label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Enquiry"}
        </Button>

        {!profile && (
          <p className="text-center text-xs text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-gold-dark hover:underline">
              Sign in
            </Link>{" "}
            first — your cart will be waiting.
          </p>
        )}
      </form>
    </div>
  );
}
