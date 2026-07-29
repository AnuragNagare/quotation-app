import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Switch({ checked, onCheckedChange, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors",
        checked ? "bg-gold" : "bg-cream-deep",
        className
      )}
    >
      <span
        className={cn(
          "inline-block size-[18px] transform rounded-full bg-white shadow-soft transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-1"
        )}
      />
    </button>
  );
}
