import { useState } from "react";
import { useApp } from "../state/store";

interface Feed {
  id: string;
  reference: string;
  action: string;
  detail?: string;
  actor: string;
  timestamp: string;
}

function dotFor(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("reject") || a.includes("cancel")) return "bg-rose-500";
  if (a.includes("approv") || a.includes("complete") || a.includes("paid"))
    return "bg-emerald-500";
  if (a.includes("book")) return "bg-brand-500";
  if (a.includes("submit")) return "bg-amber-500";
  return "bg-slate-400";
}

export function NotificationCenter() {
  const { orgRequests } = useApp();
  const [open, setOpen] = useState(false);

  const feed: Feed[] = orgRequests
    .flatMap((r) =>
      r.audit.map((a) => ({
        id: a.id,
        reference: r.reference,
        action: a.action,
        detail: a.detail,
        actor: a.actor,
        timestamp: a.timestamp,
      }))
    )
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 15);

  const count = feed.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
        aria-label="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-10 cursor-default"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
              Notifications
            </div>
            <div className="max-h-96 overflow-y-auto">
              {feed.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  No notifications yet.
                </div>
              ) : (
                feed.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-0"
                  >
                    <span
                      className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${dotFor(
                        f.action
                      )}`}
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-slate-800">
                        <span className="font-semibold">{f.reference}</span> ·{" "}
                        {f.action}
                      </div>
                      {f.detail && (
                        <div className="truncate text-xs italic text-slate-500">
                          {f.detail}
                        </div>
                      )}
                      <div className="text-xs text-slate-400">
                        {new Date(f.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
