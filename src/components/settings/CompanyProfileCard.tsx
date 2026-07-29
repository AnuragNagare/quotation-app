import { Building2, ImagePlus } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CompanyProfileCardProps {
  companyName: string;
  onCompanyNameChange: (value: string) => void;
  companyAddress: string;
  onCompanyAddressChange: (value: string) => void;
  companyGstin: string;
  onCompanyGstinChange: (value: string) => void;
  supportEmail: string;
  onSupportEmailChange: (value: string) => void;
  supportPhone: string;
  onSupportPhoneChange: (value: string) => void;
  onUploadLogo: () => void;
}

export function CompanyProfileCard({
  companyName,
  onCompanyNameChange,
  companyAddress,
  onCompanyAddressChange,
  companyGstin,
  onCompanyGstinChange,
  supportEmail,
  onSupportEmailChange,
  supportPhone,
  onSupportPhoneChange,
  onUploadLogo,
}: CompanyProfileCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-gold-dark" />
            <CardTitle>Company Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Company Name</label>
            <Input value={companyName} onChange={(e) => onCompanyNameChange(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">
              Registered Address
            </label>
            <Textarea
              rows={3}
              value={companyAddress}
              onChange={(e) => onCompanyAddressChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">
              GSTIN (Company Registration)
            </label>
            <Input value={companyGstin} onChange={(e) => onCompanyGstinChange(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding & Support Contact</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">
              Quotation & Invoice Logo
            </label>
            <button
              type="button"
              onClick={onUploadLogo}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cream-deep bg-cream-soft/40 px-4 py-8 text-center transition-colors hover:bg-cream-soft"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
                <ImagePlus className="size-4" />
              </div>
              <p className="text-xs font-semibold text-charcoal-soft">
                Click to upload company logo
              </p>
              <p className="text-[11px] text-muted">PNG or SVG, used on all PDF quotations</p>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Support Email</label>
            <Input
              type="email"
              value={supportEmail}
              onChange={(e) => onSupportEmailChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Support Phone</label>
            <Input
              type="tel"
              value={supportPhone}
              onChange={(e) => onSupportPhoneChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
