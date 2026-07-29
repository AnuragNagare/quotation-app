import { useState } from "react";
import { CheckCircle2, FileText, X } from "lucide-react";

import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsTabs, type SettingsTab } from "@/components/settings/SettingsTabs";
import { TeamMembersTable } from "@/components/settings/TeamMembersTable";
import { UserFormDrawer } from "@/components/settings/UserFormDrawer";
import { RolePermissionsMatrix } from "@/components/settings/RolePermissionsMatrix";
import { QuotationDefaultsCard } from "@/components/settings/QuotationDefaultsCard";
import { TaxesFinancialsCard } from "@/components/settings/TaxesFinancialsCard";
import { CompanyProfileCard } from "@/components/settings/CompanyProfileCard";
import {
  defaultSystemSettings,
  rolePermissionChecklist,
  teamMembers as initialTeamMembers,
} from "@/data/mockData";
import type { SystemSettings, TeamMember } from "@/types";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

interface SettingsViewProps {
  defaultTab: SettingsTab;
}

export function SettingsView({ defaultTab }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);
  const [members, setMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [permissions, setPermissions] = useState(rolePermissionChecklist);
  const [settings, setSettings] = useState<SystemSettings>(defaultSystemSettings);

  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  function addToast(title: string, message: string, type: ToastAlert["type"] = "success") {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function updateSettings(patch: Partial<SystemSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function handleSaveSystemSettings() {
    addToast(
      "System Settings Saved",
      "Role permissions, tax defaults, and quotation templates are now live across the platform."
    );
  }

  function handleAddUser() {
    setEditingMember(null);
    setUserFormOpen(true);
  }

  function handleEditRole(member: TeamMember) {
    setEditingMember(member);
    setUserFormOpen(true);
  }

  function handleSaveUser(member: TeamMember) {
    const isNew = !members.some((existing) => existing.id === member.id);
    if (isNew) {
      setMembers((prev) => [member, ...prev]);
      addToast("User Added", `${member.name} added as ${member.role} with immediate access.`);
    } else {
      setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
      addToast("Role Updated", `${member.name}'s role and access were updated.`, "info");
    }
  }

  function handleResetPassword(member: TeamMember) {
    addToast("Password Reset Sent", `A password reset link was sent to ${member.email}.`, "info");
  }

  function handleToggleStatus(member: TeamMember) {
    const nextStatus = member.status === "active" ? "inactive" : "active";
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m))
    );
    addToast(
      nextStatus === "active" ? "User Activated" : "User Deactivated",
      `${member.name} is now ${nextStatus === "active" ? "active" : "inactive"}.`,
      nextStatus === "active" ? "success" : "warning"
    );
  }

  function handleTogglePermission(id: string) {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, allowed: !p.allowed } : p))
    );
  }

  function handleUploadLogo() {
    addToast(
      "Logo Upload",
      "Logo upload is on the roadmap — branding assets can be sent to support for now.",
      "info"
    );
  }

  return (
    <>
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-top-4 fade-in flex max-w-sm items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 shadow-soft-lg duration-300"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                t.type === "info"
                  ? "bg-info-light text-info"
                  : t.type === "warning"
                  ? "bg-warning-light text-warning"
                  : "bg-success-light text-success"
              }`}
            >
              {t.type === "info" || t.type === "warning" ? (
                <FileText className="size-5" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-charcoal">{t.title}</p>
              <p className="mt-0.5 text-xs text-charcoal-soft">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 text-muted transition-colors hover:text-charcoal"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <SettingsHeader onSave={handleSaveSystemSettings} />

        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "team" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <TeamMembersTable
                members={members}
                onAddUser={handleAddUser}
                onEditRole={handleEditRole}
                onResetPassword={handleResetPassword}
                onToggleStatus={handleToggleStatus}
              />
            </div>
            <div className="lg:col-span-5">
              <RolePermissionsMatrix
                statements={permissions}
                onToggle={handleTogglePermission}
              />
            </div>
          </div>
        )}

        {activeTab === "quotation" && (
          <QuotationDefaultsCard
            directOutputFormat={settings.directOutputFormat}
            onDirectOutputFormatChange={(format) =>
              updateSettings({ directOutputFormat: format })
            }
            hotelOutputFormat={settings.hotelOutputFormat}
            onHotelOutputFormatChange={(format) => updateSettings({ hotelOutputFormat: format })}
            termsAndConditions={settings.termsAndConditions}
            onTermsChange={(value) => updateSettings({ termsAndConditions: value })}
          />
        )}

        {activeTab === "tax" && (
          <TaxesFinancialsCard
            gstRatePercent={settings.gstRatePercent}
            onGstRateChange={(value) => updateSettings({ gstRatePercent: value })}
            invoicePrefix={settings.invoicePrefix}
            onInvoicePrefixChange={(value) => updateSettings({ invoicePrefix: value })}
            paymentReminderDays={settings.paymentReminderDays}
            onPaymentReminderDaysChange={(value) =>
              updateSettings({ paymentReminderDays: value })
            }
          />
        )}

        {activeTab === "company" && (
          <CompanyProfileCard
            companyName={settings.companyName}
            onCompanyNameChange={(value) => updateSettings({ companyName: value })}
            companyAddress={settings.companyAddress}
            onCompanyAddressChange={(value) => updateSettings({ companyAddress: value })}
            companyGstin={settings.companyGstin}
            onCompanyGstinChange={(value) => updateSettings({ companyGstin: value })}
            supportEmail={settings.supportEmail}
            onSupportEmailChange={(value) => updateSettings({ supportEmail: value })}
            supportPhone={settings.supportPhone}
            onSupportPhoneChange={(value) => updateSettings({ supportPhone: value })}
            onUploadLogo={handleUploadLogo}
          />
        )}
      </div>

      <UserFormDrawer
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        editingMember={editingMember}
        onSave={handleSaveUser}
      />
    </>
  );
}
