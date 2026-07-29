import { useState } from "react";
import { Truck, User, Phone, Clock, Hash } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface LogisticsCardProps {
  initialVehicleId: string;
  initialDriverName: string;
  initialDriverPhone: string;
  initialDispatchTime: string;
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Truck;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-muted" />
        <label className="text-xs font-semibold text-charcoal-soft">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

export function LogisticsCard({
  initialVehicleId,
  initialDriverName,
  initialDriverPhone,
  initialDispatchTime,
}: LogisticsCardProps) {
  const [vehicleId, setVehicleId] = useState(initialVehicleId);
  const [driverName, setDriverName] = useState(initialDriverName);
  const [driverPhone, setDriverPhone] = useState(initialDriverPhone);
  const [dispatchTime, setDispatchTime] = useState(initialDispatchTime);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-gold-dark" />
          <CardTitle>Logistics & Transportation</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field icon={Hash} label="Vehicle ID">
          <Input
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            placeholder="e.g. MH-02-EQ-8841 (Tempo)"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field icon={User} label="Driver Name">
            <Input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Driver full name"
            />
          </Field>
          <Field icon={Phone} label="Driver Phone">
            <Input
              type="tel"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              placeholder="+91 90000 12345"
            />
          </Field>
        </div>

        <Field icon={Clock} label="Estimated Dispatch Time">
          <Input
            value={dispatchTime}
            onChange={(e) => setDispatchTime(e.target.value)}
            placeholder="18 May 2026, 10:00 AM"
          />
        </Field>

        {/* Vehicle summary chip */}
        {vehicleId && (
          <div className="flex items-center gap-3 rounded-2xl border border-cream-deep bg-cream-soft/50 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
              <Truck className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-charcoal">{vehicleId}</p>
              {driverName && (
                <p className="text-xs text-muted">Driver: {driverName}</p>
              )}
            </div>
            {dispatchTime && (
              <div className="ml-auto text-right">
                <p className="text-xs font-semibold text-charcoal-soft">
                  Dispatch
                </p>
                <p className="text-xs font-bold text-charcoal">{dispatchTime}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
