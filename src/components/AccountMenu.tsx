import { useState } from "react";
import { useApp } from "../state/store";
import { roleMeta } from "../lib/flows";

const HONORIFICS = ["dr", "prof", "mr", "mrs", "ms", "sir"];

function cleanName(name: string): string {
  // Drop any parenthetical suffix, e.g. "Olivia Bennett (Key Travel)".
  return name.replace(/\s*\(.*?\)\s*/g, "").trim();
}

export function initialsFor(name: string): string {
  const parts = cleanName(name)
    .split(/\s+/)
    .filter((w) => !HONORIFICS.includes(w.replace(/\./g, "").toLowerCase()));
  const letters = parts.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

function domainFor(orgName: string, isAgent: boolean): string {
  if (isAgent) return "keytravel.com";
  const first = orgName.replace(/\(.*?\)/g, "").trim().split(/\s+/)[0] ?? "org";
  const slug = first.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${slug || "org"}.org`;
}

export function emailFor(name: string, orgName: string, isAgent: boolean): string {
  const parts = cleanName(name)
    .split(/\s+/)
    .filter((w) => !HONORIFICS.includes(w.replace(/\./g, "").toLowerCase()))
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
    .filter(Boolean);
  const local = parts.join(".") || "user";
  return `${local}@${domainFor(orgName, isAgent)}`;
}

export function AccountMenu({ onLogout }: { onLogout: () => void }) {
  const { state, currentOrg, orgUsers } = useApp();
  const [open, setOpen] = useState(false);

  const name = state.currentUserName;
  const role = state.currentRole;
  const isAgent = role === "AGENT";
  const email = emailFor(name, currentOrg.name, isAgent);
  const user = orgUsers.find((u) => u.name === name);
  const subtitle = isAgent
    ? "Key Travel"
    : user?.title ?? roleMeta[role].label;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white py-1 pl-1 pr-2 hover:bg-slate-50"
        aria-label="Account"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {initialsFor(name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-[9rem] truncate text-xs font-semibold text-slate-800">
            {name}
          </span>
          <span className="block text-[10px] text-slate-500">
            {roleMeta[role].label}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-slate-400"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-10 cursor-default"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {initialsFor(name)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">
                  {name}
                </div>
                <div className="truncate text-xs text-slate-500">{email}</div>
                <div className="mt-0.5 truncate text-xs text-slate-400">
                  {subtitle}
                </div>
              </div>
            </div>

            <dl className="space-y-1 px-4 py-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Role</dt>
                <dd className="font-medium text-slate-700">
                  {roleMeta[role].label}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Organization</dt>
                <dd className="truncate text-right font-medium text-slate-700">
                  {currentOrg.name}
                </dd>
              </div>
              {user?.department && (
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Department</dt>
                  <dd className="font-medium text-slate-700">
                    {user.department}
                  </dd>
                </div>
              )}
            </dl>

            <div className="border-t border-slate-100 p-2">
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
