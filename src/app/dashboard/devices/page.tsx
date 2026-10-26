import { MonitorSmartphone, ShieldAlert } from "lucide-react";
import { StateCard } from "@/components/dashboard/state-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DeviceListActions } from "@/components/dashboard/device-list-actions";
import { fetchAccount } from "@/lib/api/account";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Devices",
  robots: { index: false, follow: false },
};

const DESCRIPTION =
  "Every computer and browser session enrolled with your account — live from the Devora API. Signing one out ends its access immediately.";

export default async function DevicesPage() {
  const session = await getSession();
  const result = session ? await fetchAccount(session.token) : null;

  if (!result) {
    return (
      <>
        <DashboardHeader title="Devices" description={DESCRIPTION} />
        <StateCard title="Enrolled devices" status="pending">
          <p>Sign in to view and manage your devices.</p>
        </StateCard>
      </>
    );
  }

  if (!result.ok) {
    const unauthorized =
      result.error.upstreamStatus === 401 || result.error.upstreamStatus === 403;
    return (
      <>
        <DashboardHeader title="Devices" description={DESCRIPTION} />
        <StateCard title="Enrolled devices" status="error">
          <p>
            {unauthorized
              ? "Your web session has expired or was signed out remotely. Please sign in again."
              : `The devices list could not be loaded (HTTP ${result.error.upstreamStatus ?? "?"}${result.error.upstreamCode ? `, “${result.error.upstreamCode}”` : ""}). ${result.error.message}`}
          </p>
          <p className="mt-2 font-mono text-xs text-zinc-600">request id: {result.requestId}</p>
        </StateCard>
      </>
    );
  }

  const devices = result.data.devices;
  const activeCount = devices.filter((d) => d.signedIn).length;

  return (
    <>
      <DashboardHeader
        title="Devices"
        description={DESCRIPTION}
      >
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
          {activeCount} active
        </span>
      </DashboardHeader>

      <StateCard title={`Enrolled devices (${activeCount} active)`} status="live">
        <DeviceListActions devices={devices} />
      </StateCard>

      <StateCard title="About devices" status="live">
        <ul className="space-y-2.5">
          <li className="flex gap-2.5">
            <MonitorSmartphone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" aria-hidden="true" />
            <span>
              Each sign-in — desktop or this website — enrolls one device with your account.
              This web session appears in the list and counts exactly like a computer.
            </span>
          </li>
          <li className="flex gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" aria-hidden="true" />
            <span>
              Limits and blocks are enforced server-side by the Devora API and cannot be
              bypassed from the client. Blocked devices lose access immediately.
            </span>
          </li>
        </ul>
      </StateCard>
    </>
  );
}
