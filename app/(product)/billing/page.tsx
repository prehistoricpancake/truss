import { use } from "react";
import { IconCheck } from "@tabler/icons-react";

export default function BillingPage(props: {
  searchParams: Promise<{ success?: string }>;
}) {
  // Next 16: searchParams is a Promise, must use `use()` or be in a server component with await
  const searchParams = use(props.searchParams);
  const isSuccess = searchParams.success === "true";

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-medium text-white mb-6">Billing</h1>

      {isSuccess && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/20 rounded-xl">
          <IconCheck size={16} className="text-success" />
          <p className="text-sm text-success">Subscription activated successfully!</p>
        </div>
      )}

      {/* Plan info */}
      <div className="bg-panel border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">Pro Plan</h3>
              <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-medium rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1">$29/mo · Renews Jul 15, 2024</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-panel border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Card on file</p>
            <p className="text-sm text-white mt-0.5">•••• •••• •••• 4242</p>
          </div>
          <button className="px-3 py-1.5 text-xs text-zinc-400 border border-border rounded-lg hover:text-white hover:border-zinc-500 transition-colors">
            Update
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="px-4 py-2 text-sm text-zinc-400 border border-border rounded-lg hover:text-white hover:border-zinc-500 transition-colors">
          Manage billing in Stripe
        </button>
        <button className="px-4 py-2 text-sm text-danger border border-border rounded-lg hover:border-danger/50 transition-colors">
          Cancel plan
        </button>
      </div>
    </div>
  );
}
