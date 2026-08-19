import { Link, Outlet, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function MarketplaceLayout() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { totalCount } = useCart();

  async function handleLogOut() {
    await signOut();
    navigate("/marketplace");
  }

  return (
    <div className="min-h-svh bg-cream">
      <header className="sticky top-0 z-20 border-b border-black/[0.04] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-5 py-4 sm:px-8">
          <Link to="/marketplace" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gold text-white shadow-soft">
              <span className="text-base font-extrabold">R</span>
            </div>
            <span className="text-lg font-extrabold text-charcoal">ROXY Marketplace</span>
          </Link>

          <div className="ml-auto flex items-center gap-4">
            {profile && profile.role === "client" && (
              <Link
                to="/my-enquiries"
                className="text-sm font-semibold text-charcoal-soft hover:text-charcoal"
              >
                My Enquiries
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex size-10 items-center justify-center rounded-xl bg-cream-soft text-charcoal-soft transition-colors hover:bg-cream-deep"
              aria-label="Cart"
            >
              <ShoppingCart className="size-[18px]" />
              {totalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </Link>

            {profile ? (
              <button
                onClick={handleLogOut}
                className="text-sm font-semibold text-charcoal-soft hover:text-charcoal"
              >
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-charcoal-soft hover:text-charcoal"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
