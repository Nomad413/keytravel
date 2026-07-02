import { useApp } from "../state/store";
import { Card, SectionTitle } from "../components/ui";

export function ActivityLog() {
  const { orgRequests, currentOrg } = useApp();

  const entries = orgRequests
    .flatMap((r) =>
      r.audit.map((a) => ({
        id: a.id,
        reference: r.reference,
        traveler: r.travelerName,
        action: a.action,
        detail: a.detail,
        actor: a.actor,
        timestamp: a.timestamp,
        violation: r.policy.flags.some((f) => f.severity === "violation"),
      }))
    )
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  return (
    <div>
      <SectionTitle
        title="Activity log"
        subtitle={`Full audit trail of user actions and policy events across ${currentOrg.name}.`}
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Request</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    {new Date(e.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      {e.reference}
                    </div>
                    <div className="text-xs text-slate-400">{e.traveler}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.actor}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {e.action}
                    {e.detail && (
                      <div className="text-xs italic text-slate-400">
                        {e.detail}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
