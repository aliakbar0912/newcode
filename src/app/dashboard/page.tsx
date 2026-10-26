import Link from "next/link";
import { CheckCircle2, ChevronRight, Cpu, Download, MonitorSmartphone, UserRound, XCircle } from "lucide-react";
import { StateCard, StatTile } from "@/components/dashboard/state-card";
import {
  fetchAccount,
  fetchAnnouncements,
  fetchDeviceUsage,
  fetchUpstreamHealth,
  type DevoraAnnouncement,
} from "@/lib/api/account";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(value);
}

function ServiceDot({ state }: { state: "ok" | "down" | "pending" }) {
  const map = {
    ok: { cls: "bg-emerald-400", label: "API operational" },
    down: { cls: "bg-red-400", label: "API unreachable" },
    pending: { cls: "bg-zinc-500", label: "API not checked" },
  } as const;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", map[state].cls)} aria-hidden="true" />
      {map[state].label}
    </span>
  );
}

const QUICK_ACTIONS = [
  {
    href: "/download",
    icon: Download,
    title: "Get the desktop app",
    description: "Download Devora for your computer and sign in with this account.",
  },
  {
    href: "/dashboard/devices",
    icon: MonitorSmartphone,
    title: "Manage devices",
    description: "Review enrolled computers and sign out anything you don’t recognize.",
  },
  {
    href: "/dashboard/usage",
    icon: Cpu,
    title: "View usage",
    description: "Per-device AI requests and tokens for the last 30 days.",
  },
] as const;

export default async function DashboardPage() {
  const session = await getSession();
  const [health, account, usage, announcements] = await Promise.all([
    fetchUpstreamHealth(),
    session ? fetchAccount(session.token) : Promise.resolve(null),
    session ? fetchDeviceUsage(session.token, 30) : Promise.resolve(null),
    session ? fetchAnnouncements(session.token) : Promise.resolve(null),
  ]);

  const serviceState =
    !health.ok && health.error.code === "not_configured" ? "pending" : health.ok ? "ok" : "down";
  const user = account?.ok ? account.data.user : null;
  const devices = account?.ok ? account.data.devices : null;
  const activeDevices = devices?.filter((d) => d.signedIn) ?? [];
  const notices = announcements?.ok ? announcements.data.announcements.slice(0, 4) : [];
  const models = usage?.ok ? usage.data.models : [];
  const totalRequests = models.reduce((sum, m) => sum + m.requests, 0);
  const totalTokens = models.reduce((sum, m) => sum + m.promptTokens + m.completionTokens, 0);

  const displayName = user?.name?.trim() || session?.name?.trim() || "";
  const firstName = displayName.split(/\s+/)[0] ?? "";
  const email = user?.email ?? session?.email ?? "";
  const initial = (firstName || email || "?").charAt(0).toUpperCase();

  const memberSince = user?.created
    ? new Date(user.created).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : null;

  return (
    <>
      {/* Greeting */}
      <div className="flex flex-wrap items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-white/[0.14] to-white/[0.05] text-lg font-semibold text-zinc-200 ring-1 ring-inset ring-white/[0.08]"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-sm text-muted-foreground">{email}</span>
            {user?.verified ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                Verified
              </span>
            ) : user ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-200/90">
                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Email not verified
              </span>
            ) : null}
            <ServiceDot state={serviceState} />
          </div>
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Active devices"
          value={devices ? String(activeDevices.length) : "—"}
          hint="desktop + web"
        />
        <StatTile
          label="Requests · 30d"
          value={usage?.ok ? compactNumber(totalRequests) : "—"}
          hint="this web session"
        />
        <StatTile
          label="Tokens · 30d"
          value={usage?.ok ? compactNumber(totalTokens) : "—"}
          hint="this web session"
        />
        <StatTile label="Member since" value={memberSince ?? "—"} hint="Devora account" />
      </div>

      {/* Account */}
      {account && !account.ok ? (
        <StateCard title="Account" status="error">
          <p>
            The account endpoint responded with an error
            {account.error.upstreamStatus ? ` (HTTP ${account.error.upstreamStatus})` : ""}
            {account.error.upstreamCode ? `, code “${account.error.upstreamCode}”` : ""}.{" "}
            {account.error.message}
          </p>
          <p className="mt-2 font-mono text-xs text-zinc-600">request id: {account.requestId}</p>
        </StateCard>
      ) : (
        <StateCard
          title="Account"
          status={user ? "live" : "pending"}
          actions={
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
            >
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              View profile
            </Link>
          }
        >
          {user ? (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Email
                </dt>
                <dd className="mt-1 truncate text-sm text-foreground">{user.email}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Name
                </dt>
                <dd className="mt-1 text-sm text-foreground">{user.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Member since
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {user.created
                    ? new Date(user.created).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Session expires
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {account?.ok && account.data.tokenExpiresAt
                    ? new Date(account.data.tokenExpiresAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </dd>
              </div>
              {account?.ok && account.data.identities.length > 0 ? (
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                    Linked sign-in methods
                  </dt>
                  <dd className="mt-1.5 flex flex-wrap gap-2">
                    {account.data.identities.map((identity) => (
                      <span
                        key={identity.id}
                        className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-xs capitalize text-zinc-300"
                      >
                        {identity.provider}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p>
              Your session is active, but the account endpoint couldn’t be reached right now.
              This panel fills in automatically once the connection is restored.
            </p>
          )}
        </StateCard>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.14] hover:bg-white/[0.035]"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-300"
              >
                <action.icon className="h-4 w-4" />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {action.title}
              </p>
              <ChevronRight
                className="h-4 w-4 shrink-0 -translate-x-1 text-zinc-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-zinc-500">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Billing */}
      <StateCard
        title="Plan & billing"
        status="pending"
        actions={
          <Link
            href="/pricing"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          >
            View pricing
          </Link>
        }
      >
        <p>
          Subscriptions are being connected with our payment provider — checkout is disabled
          until launch, so nothing can be charged today. When billing goes live, your plan,
          renewal date, and invoices appear here automatically.
        </p>
      </StateCard>

      {/* Announcements */}
      {notices.length > 0 ? <AnnouncementsCard notices={notices} /> : null}
    </>
  );
}

function AnnouncementLevelDot({ level }: { level: DevoraAnnouncement["level"] }) {
  if (level === "critical") return <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" aria-hidden="true" />;
  if (level === "warning") return <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />;
  return <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" aria-hidden="true" />;
}

function AnnouncementsCard({ notices }: { notices: DevoraAnnouncement[] }) {
  return (
    <StateCard title="Announcements" status="live">
      <ul className="space-y-3">
        {notices.map((notice) => (
          <li
            key={notice.slug}
            className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-4"
          >
            <div className="flex items-start gap-3">
              <AnnouncementLevelDot level={notice.level} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p className="text-sm font-medium text-foreground">{notice.title}</p>
                  <p className="text-[11px] text-zinc-600">
                    {notice.updatedAt
                      ? new Date(notice.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : null}
                  </p>
                </div>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                  {notice.body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-zinc-600">
        Published by the Devora team — the same notices the desktop app shows.
      </p>
    </StateCard>
  );
}
