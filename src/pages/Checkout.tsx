import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Mail, Phone, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { submitPublicEnquiry } from "@/lib/enquiries";
import { formatINR } from "@/lib/format";

export function Checkout() {
  const navigate = useNavigate();
  const { items, totalAmount, clear } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // A submit clears the cart as part of success, which would otherwise
  // re-trigger this "cart is empty, bounce to /cart" guard and hide the
  // confirmation — this ref distinguishes that case from someone navigating
  // to /checkout directly with nothing in their cart.
  const justSubmittedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !justSubmittedRef.current) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await submitPublicEnquiry(
        { fullName: fullName.trim(), email: email.trim(), phone: phone.trim() },
        items.map((i) => ({
          catalogItemId: i.catalogItemId,
          companyId: i.companyId,
          quantity: i.quantity,
        })),
        notes.trim() || undefined
      );
      justSubmittedRef.current = true;
      clear();
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-card border border-black/[0.03] bg-white p-10 text-center shadow-soft">
        <div className="flex size-14 items-center justify-center rounded-full bg-success-light text-success">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-charcoal">Enquiry Submitted</h1>
        <p className="text-sm text-muted">
          Thanks, {fullName.trim() || "there"}! The companies you enquired with will review your
          request and get back to you at <span className="font-semibold text-charcoal">{email.trim()}</span>.
        </p>
        <Button asChild className="mt-2">
          <Link to="/marketplace">Browse More</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Submit Your Enquiry</h1>
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
        <p className="text-xs text-muted">
          Just your contact details — no account needed. The companies will use these to send
          you their quotes.
        </p>
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
            Phone number
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
            Notes for this enquiry (optional)
          </label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Enquiry"}
        </Button>
      </form>
    </div>
  );
}
