import { IconSparkles, IconCreditCard } from "@tabler/icons-react";

export default function BillingPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-medium text-white mb-6">Billing</h1>

      <div className="bg-panel border border-border rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <IconCreditCard size={28} stroke={1.5} className="text-accent" />
        </div>

        <h2 className="text-lg font-medium text-white mb-2">Payments coming soon</h2>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
          We&apos;re putting the finishing touches on our billing system.
          In the meantime, enjoy full access to all features for free.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
          <IconSparkles size={16} className="text-success" />
          <span className="text-sm text-success font-medium">All features unlocked</span>
        </div>
      </div>
    </div>
  );
}
