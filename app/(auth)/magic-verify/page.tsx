"use client";

import { use, useEffect, useRef, useState } from "react";
import { IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { verifyMagicAndSignIn } from "@/app/actions/magic";

export default function MagicVerifyPage(props: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = use(props.searchParams);
  const [error, setError] = useState(!token || !email);
  const called = useRef(false);

  useEffect(() => {
    if (!token || !email || called.current) return;
    called.current = true;

    verifyMagicAndSignIn(email, token).then((res) => {
      // If res is returned (not thrown), it means sign-in failed
      if (res?.error) setError(true);
      // If res is undefined the server action threw NEXT_REDIRECT — navigation happens automatically
    }).catch(() => setError(true));
  }, [token, email]);

  if (error) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <IconAlertCircle size={40} stroke={1.5} className="text-danger mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Link expired or invalid</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Magic links expire after 15 minutes and can only be used once.
        </p>
        <a
          href="/login"
          className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-full transition-colors"
        >
          Request a new link
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-8">
      <IconLoader2 size={40} stroke={1.5} className="text-accent animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">Signing you in…</h2>
      <p className="text-sm text-zinc-500">Just a moment.</p>
    </div>
  );
}
