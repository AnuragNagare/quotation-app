import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-soft-lg">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gold text-white shadow-soft">
            <span className="text-xl font-extrabold">R</span>
          </div>
          <div>
            <p className="text-xl font-extrabold text-charcoal">ROXY</p>
            <p className="text-xs font-medium text-muted">
              Quotation & Event Management
            </p>
          </div>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input type="email" placeholder="you@roxy.com" className="pl-10" required />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input type="password" placeholder="••••••••" className="pl-10" required />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-2 w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
