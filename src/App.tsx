import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { RequireAuth, RedirectIfAuthed } from "@/components/auth/RequireAuth";
import { Login } from "@/pages/Login";
import { Home } from "@/pages/Home";
import { Companies } from "@/pages/Companies";
import { Catalog } from "@/pages/Catalog";
import { Clients } from "@/pages/Clients";
import { Enquiries } from "@/pages/Enquiries";
import { QuoteBuilder } from "@/pages/QuoteBuilder";
import { Marketplace } from "@/pages/Marketplace";
import { MarketplaceCompany } from "@/pages/MarketplaceCompany";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <Login />
                </RedirectIfAuthed>
              }
            />

            {/* Public marketplace — open users browse, build a cart across any
                companies, and submit an enquiry with just name/email/phone. */}
            <Route element={<MarketplaceLayout />}>
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/:companyId" element={<MarketplaceCompany />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>

            {/* Internal admin shell — companies, catalogs, clients, enquiries, quotes. */}
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/enquiries" element={<Enquiries />} />
                <Route path="/quotes/:enquiryId/:companyId" element={<QuoteBuilder />} />
              </Route>
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
