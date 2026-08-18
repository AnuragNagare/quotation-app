import { BrowserRouter, Routes, Route } from "react-router-dom";

import { EquipmentProvider } from "@/context/EquipmentContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Enquiries } from "@/pages/Enquiries";
import { Customers } from "@/pages/Customers";
import { Hotels } from "@/pages/Hotels";
import { Quotations } from "@/pages/Quotations";
import { FollowUps } from "@/pages/FollowUps";
import { Events } from "@/pages/Events";
import { Equipment } from "@/pages/Equipment";
import { Invoices } from "@/pages/Invoices";
import { Reports } from "@/pages/Reports";
import { Analytics } from "@/pages/Analytics";
import { Users } from "@/pages/Users";
import { Settings } from "@/pages/Settings";
import { PublicQuote } from "@/pages/PublicQuote";

function App() {
  return (
    <BrowserRouter>
      <EquipmentProvider>
        <CustomerProvider>
          <Routes>
            {/* Public shareable quote page — no auth, no layout */}
            <Route path="/q/:quoteId" element={<PublicQuote />} />
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/enquiries" element={<Enquiries />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/follow-ups" element={<FollowUps />} />
              <Route path="/events" element={<Events />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </CustomerProvider>
      </EquipmentProvider>
    </BrowserRouter>
  );
}

export default App;
