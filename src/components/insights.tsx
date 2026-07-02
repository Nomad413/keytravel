import type { ReactNode } from "react";
import { Card } from "./ui";
import { formatMoney } from "../lib/policy";
import type { BudgetUsage, RankItem, TypeStat } from "../lib/insights";
import { tripAccent, tripTypeLabel } from "../lib/trip";
import { TripIcon } from "./icons";
import { Flag } from "./Location";

export function KpiCard({
  label,
  value,
  sub,
  tone = "slate",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "slate" | "brand" | "emerald" | "amber" | "rose" | "violet";
}) {
  const tones: Record<string, string> = {
    slate: "text-slate-900",
    brand: "text-brand-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    violet: "text-violet-700",
  };
  return (
    <Card className="p-4">
      <div className={`text-2xl font-bold ${tones[tone]}`}>{value}</div>
      <div className="mt-0.5 text-xs font-medium text-slate-500">{label}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </Card>
  );
}

const barColors = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-sky-500",
];

export function RankedList({
  title,
  subtitle,
  items,
  currency,
  max = 5,
  emptyText = "No data yet.",
  withFlags = false,
}: {
  title: string;
  subtitle?: string;
  items: RankItem[];
  currency: string;
  max?: number;
  emptyText?: string;
  withFlags?: boolean;
}) {
  const shown = items.slice(0, max);
  const top = shown.length ? Math.max(...shown.map((i) => i.count)) : 1;
  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="mb-3 text-xs text-slate-400">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {shown.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">{emptyText}</div>
      ) : (
        <ol className="space-y-3">
          {shown.map((item, i) => (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium text-slate-700">
                    {withFlags && <span className="mr-1">{<Flag location={item.label} />}</span>}
                    {item.label}
                  </span>
                </span>
                <span className="flex-none text-xs text-slate-500">
                  {item.count} trip{item.count === 1 ? "" : "s"}
                  {item.spend > 0 && ` · ${formatMoney(item.spend, currency)}`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${barColors[i % barColors.length]}`}
                  style={{ width: `${Math.max(6, (item.count / top) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export function TypeBreakdown({
  byType,
  currency,
}: {
  byType: TypeStat[];
  currency: string;
}) {
  const totalSpend = byType.reduce((s, t) => s + t.spend, 0) || 1;
  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-bold text-slate-800">Spend by type</h3>
      <div className="space-y-3">
        {byType.map((t) => {
          const accent = tripAccent[t.type];
          const pct = Math.round((t.spend / totalSpend) * 100);
          return (
            <div key={t.type}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={`flex items-center gap-2 font-medium ${accent.text}`}>
                  <TripIcon type={t.type} className="h-4 w-4" />
                  {tripTypeLabel[t.type]}
                </span>
                <span className="text-xs text-slate-500">
                  {t.count} · {formatMoney(t.spend, currency)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${accent.solid}`}
                  style={{ width: `${Math.max(3, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function ComplianceCard({
  rate,
  label = "Policy compliance",
  sub,
}: {
  rate: number;
  label?: string;
  sub?: string;
}) {
  const tone =
    rate >= 90 ? "text-emerald-600" : rate >= 70 ? "text-amber-600" : "text-rose-600";
  const bar =
    rate >= 90 ? "bg-emerald-500" : rate >= 70 ? "bg-amber-500" : "bg-rose-500";
  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-bold text-slate-800">{label}</h3>
      <div className={`text-3xl font-bold ${tone}`}>{rate}%</div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${rate}%` }} />
      </div>
      {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
    </Card>
  );
}

export function BudgetCard({
  usage,
  currency,
}: {
  usage: BudgetUsage[];
  currency: string;
}) {
  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-bold text-slate-800">
        Department budget utilization
      </h3>
      <div className="space-y-3">
        {usage.map((u) => {
          const over = u.pct >= 100;
          const bar =
            u.pct >= 100 ? "bg-rose-500" : u.pct >= 80 ? "bg-amber-500" : "bg-emerald-500";
          return (
            <div key={u.department}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{u.department}</span>
                <span className={`text-xs ${over ? "text-rose-600" : "text-slate-500"}`}>
                  {formatMoney(u.used, currency)} / {formatMoney(u.limitAmount, currency)} ·{" "}
                  {u.pct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${bar}`}
                  style={{ width: `${Math.min(100, u.pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-bold text-slate-800">{title}</h3>
      {children}
    </Card>
  );
}
