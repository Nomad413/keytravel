import { useState } from "react";
import { useApp } from "./state/store";
import type { Role } from "./types";
import { labelForView, roleMeta, roleNav } from "./lib/flows";
import { RoleDashboard } from "./screens/RoleDashboard";
import { CreateRequest } from "./screens/CreateRequest";
import { MyTrips } from "./screens/MyTrips";
import { ApproverInbox } from "./screens/ApproverInbox";
import { ChainSimulator } from "./screens/ChainSimulator";
import { AdminConsole } from "./screens/AdminConsole";
import { ActivityLog } from "./screens/ActivityLog";
import { Finance } from "./screens/Finance";
import { Reporting } from "./screens/Reporting";
import { AgentClients } from "./screens/AgentClients";
import { Login } from "./screens/Login";
import { NotificationCenter } from "./components/NotificationCenter";
import { AccountMenu } from "./components/AccountMenu";

const ROLES: Role[] = [
  "AGENT",
  "TRAVELER",
  "ARRANGER",
  "APPROVER",
  "ADMIN",
  "FINANCE",
];

export default function App() {
  const { state, dispatch, orgRequests } = useApp();
  const role = state.currentRole;
  const nav = roleNav[role];
  const [signedIn, setSignedIn] = useState(false);

  const pendingCount = orgRequests.filter((r) => r.status === "PENDING").length;

  if (!signedIn) {
    return <Login onSignIn={() => setSignedIn(true)} />;
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
              KT
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Key Travel · B2B Travel Portal
              </div>
              <div className="text-xs text-slate-500">
                Role-based travel management — prototype
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-slate-500">
              Organization
              <select
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500"
                value={state.currentOrgId}
                onChange={(e) =>
                  dispatch({ type: "SET_ORG", orgId: e.target.value })
                }
              >
                {state.organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1 text-xs text-slate-500">
              Role
              <select
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500"
                value={role}
                onChange={(e) =>
                  dispatch({ type: "SET_ROLE", role: e.target.value as Role })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleMeta[r].label}
                  </option>
                ))}
              </select>
            </label>
            <NotificationCenter />
            <AccountMenu onLogout={() => setSignedIn(false)} />
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {nav.map((view) => {
            const active = state.view === view;
            return (
              <button
                key={view}
                onClick={() => dispatch({ type: "SET_VIEW", view })}
                className={`relative whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {labelForView(view, role)}
                {view === "approvals" && pendingCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {state.view === "dashboard" && <RoleDashboard />}
        {state.view === "create" && <CreateRequest />}
        {state.view === "trips" && <MyTrips />}
        {state.view === "approvals" && <ApproverInbox />}
        {state.view === "simulate" && <ChainSimulator />}
        {state.view === "admin" && <AdminConsole />}
        {state.view === "activity" && <ActivityLog />}
        {state.view === "finance" && <Finance />}
        {state.view === "reporting" && <Reporting />}
        {state.view === "clients" && <AgentClients />}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-2 text-center text-xs text-slate-400">
        Prototype for the Key Travel presale assignment · in-memory data, no
        backend · refresh to reset.
      </footer>
    </div>
  );
}
