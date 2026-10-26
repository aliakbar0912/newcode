import Link from "next/link";
import { CheckCircle2, ExternalLink, Info, MonitorSmartphone, ShieldCheck, XCircle } from "lucide-react";
import { StateCard } from "@/components/dashboard/state-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfileActions } from "@/components/dashboard/profile-actions";
import { fetchAccount } from "@/lib/api/account";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function ProfilePage() {
  const session = await getSession();
  const result = session ? await fetchAccount(session.token) : null;

  const user = result?.ok ? result.data.user : null;
  const identities = result?.ok ? result.data.identities : [];
  const displayName = user?.name?.trim() || session?.name?.trim() || "";
  const email = user?.email ?? session?.email ?? "";
  const initial = (displayName || email || "?").charAt(0).toUpperCase();

  return (
    <>
      <DashboardHeader
        title="Profile"
        description="Your Devora identity, sign-in methods, and this browser's session."
      />

      {/* Identity */}
      <StateCard title="Identity" status={user ? "live" : "pending"}>
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-white/[0.14] to-white/[0.05] text-xl font-semibold text-zinc-200 ring-1 ring-inset ring-white/[0.08]"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2.5 text-base font-medium text-foreground">
              {displayName || "Devora account"}
              {user?.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  Verified
                </span>
              ) : user ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                  <XCircle className="h-3 w-3" aria-hidden="true" />
                  Unverified
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        {user ? (
          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Name
              </dt>
              <dd className="mt-1 text-sm text-foreground">{user.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Member since
              </dt>
              <dd className="mt-1 text-sm text-foreground">{formatDate(user.created)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Account ID
              </dt>
              <dd className="mt-1 font-mono text-xs text-zinc-400">{user.id}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-5 border-t border-white/[0.06] pt-5">
            Your session is active, but the account endpoint couldn’t be reached right now.
            Details appear here automatically once the connection is restored.
          </p>
        )}
      </StateCard>

      {/* Sign-in methods */}
      <StateCard title="Sign-in methods" status={result?.ok ? "live" : "pending"}>
        {identities.length > 0 ? (
          <ul className="space-y-2.5">
            {identities.map((identity) => (
              <li key={identity.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3">
                <span className="flex items-center gap-2.5 text-sm text-foreground">
                  <ShieldCheck className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  <span className="capitalize">{identity.provider}</span>
                </span>
                <span className="text-xs text-zinc-600">linked {formatDate(identity.created)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No linked providers yet — you sign in with email and password. Your password can
            be changed from the{" "}
            <Link href="/forgot-password" className="text-zinc-300 underline-offset-4 hover:underline">
              password reset flow
            </Link>
            .
          </p>
        )}
      </StateCard>

      {/* Session */}
      <StateCard
        title="This browser's session"
        status={result?.ok ? "live" : "pending"}
        actions={<ProfileActions />}
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Device
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
              <MonitorSmartphone className="h-4 w-4 text-zinc-500" aria-hidden="true" />
              Web — this browser
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Session expires
            </p>
            <p className="mt-1 text-sm text-foreground">
              {result?.ok ? formatDate(result.data.tokenExpiresAt) : "—"}
            </p>
          </div>
        </div>
        <p className="mt-5 flex items-start gap-2 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-zinc-500">
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            Signing out here ends this browser’s access. To sign out other computers or
            review every enrolled device, use the{" "}
            <Link href="/dashboard/devices" className="text-zinc-300 underline-offset-4 hover:underline">
              devices page
            </Link>
            .
          </span>
        </p>
      </StateCard>

      {/* Honest capability note */}
      <StateCard title="Editing profile details" status="pending">
        <p className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" aria-hidden="true" />
          <span>
            Changing your name or email isn’t available yet — account updates arrive with the
            next release. Right now your name comes from your sign-in method, and your email
            is the identity the whole Service is keyed to.
          </span>
        </p>
      </StateCard>
    </>
  );
}
