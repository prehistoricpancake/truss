import { redirect } from "next/navigation";
import { IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";

export default async function MagicVerifyPage(props: {
  searchParams: Promise<{ token?: string; email?: string; error?: string }>;
}) {
  const { token, email, error } = await props.searchParams;

  if (error || !token || !email) {
    return (
      <div className="max-w-sm flex flex-col items-center text-center py-8">
        <IconAlertCircle size={40} stroke={1.5} className="text-danger mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Link expired or invalid</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Magic links expire after 15 minutes and can only be used once.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-full transition-colors"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  redirect(`/api/auth/magic-callback?token=${token}&email=${encodeURIComponent(email)}`);
}
