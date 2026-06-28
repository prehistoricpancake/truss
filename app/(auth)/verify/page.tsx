"use client";

import Link from "next/link";
import { useState, use } from "react";

export default function VerifyPage(props: {
  searchParams: Promise<{ email?: string }>;
}) {
  const searchParams = use(props.searchParams);
  const email = searchParams.email || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { confirmSignUp } = await import("@/lib/cognito");
      await confirmSignUp(email, code);
      window.location.href = "/success";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { resendConfirmationCode } = await import("@/lib/cognito");
      await resendConfirmationCode(email);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    }
  };

  return (
    <>
      <Link href="/" className="text-xl font-semibold text-white tracking-tight mb-10">
        truss
      </Link>

      <h2 className="text-2xl font-semibold text-white mb-1">Verify your email</h2>

      <div className="mb-6 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg text-xs text-zinc-300">
        Code sent to {email}
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-3 bg-panel-auth-input border border-border-auth rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-accent/50 transition-colors mb-2"
          maxLength={6}
        />

        <button type="button" onClick={handleResend} className="text-xs text-accent hover:underline mb-4 block">
          Resend code
        </button>

        <button
          type="submit"
          disabled={code.length < 6 || loading}
          className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Verifying\u2026" : "Verify and continue"}
        </button>
      </form>
    </>
  );
}
