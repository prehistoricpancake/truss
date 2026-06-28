import Link from "next/link";
import { IconCircleCheck } from "@tabler/icons-react";

export default function SuccessPage() {
  return (
    <>
      <Link href="/" className="text-xl font-semibold text-white tracking-tight mb-10">
        truss
      </Link>

      <div className="flex flex-col items-center text-center py-8">
        <IconCircleCheck size={48} className="text-success mb-4" stroke={1.5} />
        <h2 className="text-2xl font-semibold text-white mb-2">Account created</h2>
        <p className="text-sm text-zinc-500 mb-8">
          You&apos;re all set. Let&apos;s connect your first platform.
        </p>

        <Link
          href="/dashboard"
          className="w-full py-3 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors text-center block"
        >
          Go to dashboard
        </Link>
      </div>
    </>
  );
}
