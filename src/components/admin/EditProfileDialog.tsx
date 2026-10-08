import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Profile } from "@/types/database";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onSave: (patch: { full_name: string; phone: string; avatar_url?: string | null }) => Promise<void>;
}

export function EditProfileDialog({ open, onOpenChange, profile, onSave }: EditProfileDialogProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
    setErrorMsg("");
  }, [open, profile]);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Please select an image smaller than 2MB.");
      return;
    }
    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl((event.target?.result as string) || "");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        full_name: fullName.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl.trim() || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Full name
            </label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">Email</label>
            <Input value={profile?.email ?? ""} disabled />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-charcoal-soft">
              Logo / Avatar (optional)
            </label>
            {avatarUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-cream-deep bg-cream/40 p-2.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-black/5 bg-white p-1 shadow-sm">
                  <img
                    src={avatarUrl}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-charcoal truncate">Logo selected</p>
                  <p className="text-[11px] text-muted">Displays in documents and profile</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAvatarUrl("")}
                  className="h-8 text-xs text-danger"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFile}
                  className="cursor-pointer text-xs file:mr-2 file:rounded-md file:border-0 file:bg-cream file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-charcoal"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted">Or URL:</span>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="h-8 text-xs flex-1"
                  />
                </div>
              </div>
            )}
            {errorMsg && <p className="mt-1 text-xs text-danger">{errorMsg}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
