import type { ReactNode } from "react";
import type { FlagSeverity, RequestStatus, StepDecision } from "../types";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
    BOOKED: "bg-brand-100 text-brand-700",
    COMPLETED: "bg-slate-200 text-slate-700",
    CANCELLED: "bg-slate-100 text-slate-400 line-through",
  };
  const label: Record<RequestStatus, string> = {
    DRAFT: "Draft",
    PENDING: "Pending approval",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    BOOKED: "Booked",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}

export function DecisionBadge({ decision }: { decision: StepDecision }) {
  const map: Record<StepDecision, string> = {
    PENDING: "bg-slate-100 text-slate-500",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
    INFO_REQUESTED: "bg-amber-100 text-amber-700",
  };
  const label: Record<StepDecision, string> = {
    PENDING: "Awaiting",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    INFO_REQUESTED: "Info requested",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[decision]}`}
    >
      {label[decision]}
    </span>
  );
}

export function FlagRow({
  severity,
  message,
}: {
  severity: FlagSeverity;
  message: string;
}) {
  const styles: Record<FlagSeverity, { box: string; dot: string; icon: string }> =
    {
      ok: {
        box: "bg-emerald-50 border-emerald-200 text-emerald-800",
        dot: "bg-emerald-500",
        icon: "✓",
      },
      warning: {
        box: "bg-amber-50 border-amber-200 text-amber-800",
        dot: "bg-amber-500",
        icon: "!",
      },
      violation: {
        box: "bg-rose-50 border-rose-200 text-rose-800",
        dot: "bg-rose-500",
        icon: "✕",
      },
    };
  const s = styles[severity];
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${s.box}`}>
      <span
        className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold text-white ${s.dot}`}
      >
        {s.icon}
      </span>
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
