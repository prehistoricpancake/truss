"use client";

import Link from "next/link";
import { useState } from "react";
import { IconMail, IconCircleCheck } from "@tabler/icons-react";
import { sendMagicLink } from "@/app/actions/magic";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    const result = await sendMagicLink(email);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || "Something went wrong.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="max-w-sm flex flex-col items-center text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
          <IconCircleCheck size={28} stroke={1.5} className="text-accent" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Check your email</h2>
        <p className="text-sm text-zinc-500 mb-1">We sent a sign-in link to</p>
        <p className="text-sm text-white font-medium mb-6">{email}</p>
        <p className="text-xs text-zinc-600">The link expires in 15 minutes.</p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-xs text-accent hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm">
      <p className="text-sm text-zinc-500 mb-8">
        Enter your email and we&apos;ll send you a sign-in link.
      </p>

      {error && (
        <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-zinc-500 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-panel-auth-input border border-border-auth rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-accent/50 transition-colors mb-4"
          autoFocus
        />

        <button
          type="submit"
          disabled={!email || loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IconMail size={16} stroke={1.5} />
          {loading ? "Sending…" : "Send sign-in link"}
        </button>
      </form>

      <p className="text-xs text-zinc-600 mt-6">
        By continuing, you agree to our{" "}
        <span className="text-zinc-400 hover:underline cursor-pointer">Terms of Service</span> and{" "}
        <span className="text-zinc-400 hover:underline cursor-pointer">Privacy Policy</span>.
      </p>

      <p className="text-xs text-zinc-600 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
