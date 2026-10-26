import Link from "next/link";
import { CreditCard } from "lucide-react";
import { StateCard } from "@/components/dashboard/state-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export const metadata = {
  title: "Subscription",
  robots: { index: false, follow: false },
};

export default function SubscriptionPage() {
  return (
    <>
      <DashboardHeader
        title="Subscription"
        description="Your current plan, billing state, and renewal information."
      />

      <StateCard title="Subscription status" status="pending">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300"
          >
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Billing is on the way</p>
            <p className="mt-1 max-w-xl leading-relaxed">
              Subscriptions are being connected with our payment provider. Checkout is
              disabled until launch, so nothing can be charged today — and there is no real
              subscription state to show yet, so Devora won’t invent one.
            </p>
            <p className="mt-1.5 max-w-xl leading-relaxed">
              When billing goes live, your plan, renewal date, invoices, and the customer
              portal appear here automatically.
            </p>
          </div>
        </div>
      </StateCard>

      <StateCard title="Meanwhile" status="live">
        <ul className="space-y-2.5">
          <li>
            — Review the planned tiers on the{" "}
            <Link href="/pricing" className="text-zinc-300 underline-offset-4 hover:underline">
              pricing page
            </Link>{" "}
            (checkout is disabled — nothing can be charged).
          </li>
          <li>
            — Billing terms and refund windows are already published in the{" "}
            <Link href="/refunds" className="text-zinc-300 underline-offset-4 hover:underline">
              Refund Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-zinc-300 underline-offset-4 hover:underline">
              Terms of Service
            </Link>
            .
          </li>
          <li>
            — Questions?{" "}
            <Link href="/support" className="text-zinc-300 underline-offset-4 hover:underline">
              Contact support
            </Link>
            .
          </li>
        </ul>
      </StateCard>
    </>
  );
}
