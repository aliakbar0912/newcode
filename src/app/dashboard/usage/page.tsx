import { StateCard } from "@/components/dashboard/state-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { fetchDeviceUsage } from "@/lib/api/account";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Usage",
  robots: { index: false, follow: false },
};

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export default async function UsagePage() {
  const session = await getSession();
  const result = session ? await fetchDeviceUsage(session.token, 30) : null;

  const header = (
    <DashboardHeader
      title="Usage"
      description="AI requests and tokens for the last 30 days, straight from the Devora API — never estimates."
    />
  );

  if (!result) {
    return (
      <>
        {header}
        <StateCard title="Usage information" status="pending">
          <p>Sign in to view usage.</p>
        </StateCard>
      </>
    );
  }

  if (!result.ok) {
    const unauthorized = result.error.upstreamStatus === 401 || result.error.upstreamStatus === 403;
    return (
      <>
        {header}
        <StateCard title="Usage information" status="error">
          <p>
            {unauthorized
              ? "Your web session has expired or was signed out remotely. Please sign in again."
              : `Usage could not be loaded (HTTP ${result.error.upstreamStatus ?? "?"}). ${result.error.message}`}
          </p>
          <p className="mt-2 font-mono text-xs text-zinc-600">request id: {result.requestId}</p>
        </StateCard>
      </>
    );
  }

  const usage = result.data;
  const totalRequests = usage.models.reduce((sum, m) => sum + m.requests, 0);
  const totalOk = usage.models.reduce((sum, m) => sum + m.ok, 0);
  const totalFailed = usage.models.reduce((sum, m) => sum + m.failed, 0);
  const totalPrompt = usage.models.reduce((sum, m) => sum + m.promptTokens, 0);
  const totalCompletion = usage.models.reduce((sum, m) => sum + m.completionTokens, 0);
  const successRate =
    totalRequests > 0 ? Math.round((totalOk / totalRequests) * 100) : null;

  return (
    <>
      {header}

      <StateCard title="Last 30 days — this web session" status="live">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Requests", value: formatNumber(totalRequests) },
            { label: "Success rate", value: successRate === null ? "—" : `${successRate}%` },
            { label: "Failed", value: formatNumber(totalFailed) },
            {
              label: "Tokens",
              value: formatNumber(totalPrompt + totalCompletion),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {usage.models.length > 0 ? (
          <div className="mt-5 overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                  <th className="px-4 py-2.5 font-medium">Model</th>
                  <th className="px-4 py-2.5 font-medium">Requests</th>
                  <th className="px-4 py-2.5 font-medium">OK</th>
                  <th className="px-4 py-2.5 font-medium">Failed</th>
                  <th className="px-4 py-2.5 font-medium">Prompt / completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {usage.models.map((m) => (
                  <tr key={m.modelId} className="transition-colors hover:bg-white/[0.015]">
                    <td className="px-4 py-2.5 text-foreground">{m.modelName || m.modelId}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">
                      {formatNumber(m.requests)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">
                      {formatNumber(m.ok)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">
                      {formatNumber(m.failed)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">
                      {formatNumber(m.promptTokens)} / {formatNumber(m.completionTokens)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-500">
            No AI requests yet from this browser session. Usage is scoped per device: your
            desktop app’s activity is attributed to that device, and this page reports the
            website’s own numbers.
          </p>
        )}
      </StateCard>

      <StateCard title="About this data" status="live">
        <p>
          The Devora API reports usage per device for privacy and security: a device can only
          ever read its own records. Desktop usage lives in the desktop app; this page always
          reflects the website session’s own numbers.
        </p>
      </StateCard>
    </>
  );
}
