import { Building2, IndianRupee, User, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/format";

interface CustomerMetricsRowProps {
  totalActive: number;
  hotelPartners: number;
  directClients: number;
  totalLifetimeRevenue: number;
}

export function CustomerMetricsRow({
  totalActive,
  hotelPartners,
  directClients,
  totalLifetimeRevenue,
}: CustomerMetricsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Total Active Clients</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {totalActive} <span className="text-base font-semibold text-muted">Accounts</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <Users className="size-5" />
          </div>
        </div>
      </Card>

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Hotel Partners</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {hotelPartners} <span className="text-base font-semibold text-muted">Venues</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-light text-purple">
            <Building2 className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="rounded-md bg-purple-light px-2 py-0.5 text-xs font-bold text-purple">
            EOM Billing
          </span>
        </div>
      </Card>

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Direct Clients</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {directClients} <span className="text-base font-semibold text-muted">Accounts</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-info-light text-info">
            <User className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="rounded-md bg-info-light px-2 py-0.5 text-xs font-bold text-info">
            Same-Day Billing
          </span>
        </div>
      </Card>

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Total Lifetime Revenue</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {formatINR(totalLifetimeRevenue)}
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-success-light text-success">
            <IndianRupee className="size-5" />
          </div>
        </div>
      </Card>
    </div>
  );
}
