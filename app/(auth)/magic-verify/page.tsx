"use client";

import { useEffect, useState, use } from "react";
import { signIn } from "next-auth/react";
import { IconLoader2, IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";

export default function MagicVerifyPage(props: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = use(props.searchParams);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    !token || !email ? "error" : "loading"
  );

  useEffect(() => {
    if (!token || !email) return;

    signIn("credentials", { email, token, redirect: false }).then((res) => {
      if (res?.ok) {
        setStatus("success");
        window.location.href = "/onboarding";
      } else {
        setStatus("error");
      }
    });
  }, [token, email]);

  return (
    <div className="flex flex-col items-center text-center py-8">
      {status === "loading" && (
        <>
          <IconLoader2 size={40} stroke={1.5} className="text-accent animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Signing you in…</h2>
          <p className="text-sm text-zinc-500">Just a moment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <IconCircleCheck size={40} stroke={1.5} className="text-success mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Signed in!</h2>
          <p className="text-sm text-zinc-500">Redirecting…</p>
        </>
      )}

      {status === "error" && (
        <>
          <IconAlertCircle size={40} stroke={1.5} className="text-danger mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Link expired or invalid</h2>
          <p className="text-sm text-zinc-500 mb-6">Magic links expire after 15 minutes and can only be used once.</p>
          <a
            href="/login"
            className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-full transition-colors"
          >
            Request a new link
          </a>
        </>
      )}
    </div>
  );
}
