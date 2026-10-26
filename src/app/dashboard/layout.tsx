import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// The entire /dashboard segment is user-specific: never cache it statically.
export const dynamic = "force-dynamic";

/**
 * Server-side guard for the entire /dashboard area. Authorization is enforced
 * here — never by merely hiding frontend components.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  if (!session) {
    redirect("/login?next=%2Fdashboard");
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-10 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.045),transparent)]"
      />
      <div className="relative lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <aside className="mb-8 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
          <DashboardNav
            user={{ email: session.email, name: session.name ?? null }}
          />
        </aside>
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  );
}
