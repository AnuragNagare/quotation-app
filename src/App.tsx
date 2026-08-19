import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { CompanyProvider } from "@/context/CompanyContext";
import { CartProvider } from "@/context/CartContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { RequireAuth, RequireInternalUser, RedirectIfAuthed } from "@/components/auth/RequireAuth";
import { RequireRole } from "@/components/auth/RequireRole";
import { Login } from "@/pages/Login";
import { Home } from "@/pages/Home";
import { Companies } from "@/pages/Companies";
import { Catalog } from "@/pages/Catalog";
import { BizEnquiries } from "@/pages/BizEnquiries";
import { BizQuoteBuilder } from "@/pages/BizQuoteBuilder";
import { AdminPeople } from "@/pages/AdminPeople";
import { AdminEnquiries } from "@/pages/AdminEnquiries";
import { AdminQuotes } from "@/pages/AdminQuotes";
import { Marketplace } from "@/pages/Marketplace";
import { MarketplaceCompany } from "@/pages/MarketplaceCompany";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";
import { MyEnquiries } from "@/pages/MyEnquiries";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
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

              {/* Public marketplace — browsing/cart/checkout work anonymously; only
                  "My Enquiries" requires a signed-in session. */}
              <Route element={<MarketplaceLayout />}>
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/:companyId" element={<MarketplaceCompany />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route element={<RequireAuth />}>
                  <Route path="/my-enquiries" element={<MyEnquiries />} />
                </Route>
              </Route>

              {/* Internal business shell — Admin/Business User only; a signed-in
                  Client is redirected to /my-enquiries by RequireInternalUser. */}
              <Route element={<RequireAuth />}>
                <Route element={<RequireInternalUser />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route element={<RequireRole roles={["business_user"]} />}>
                      <Route path="/companies" element={<Companies />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/biz/enquiries" element={<BizEnquiries />} />
                      <Route path="/biz/quotes/:enquiryId" element={<BizQuoteBuilder />} />
                    </Route>
                    <Route element={<RequireRole roles={["admin"]} />}>
                      <Route path="/admin/people" element={<AdminPeople />} />
                      <Route path="/admin/enquiries" element={<AdminEnquiries />} />
                      <Route path="/admin/quotes" element={<AdminQuotes />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Routes>
          </CartProvider>
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
