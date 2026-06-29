"use client";

import Link from "next/link";
import { useState } from "react";
import { IconBrandGoogle } from "@tabler/icons-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    // Uses next-auth signIn with cognito provider for Google federation
    window.location.href = "/api/auth/signin/cognito";
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    window.location.href = "/api/auth/signin/cognito?callbackUrl=/dashboard";
  };

  return (
    <>
      {/* Wordmark */}
      <Link href="/" className="text-xl font-semibold text-white tracking-tight mb-10">
        truss
      </Link>

      <h2 className="text-2xl font-semibold text-white mb-1">Welcome back</h2>
      <p className="text-sm text-zinc-500 mb-8">Sign in to your account</p>

      {/* Google button */}
      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center gap-3 px-4 py-3 bg-panel-auth-input border border-border-auth rounded-lg text-sm text-zinc-300 hover:bg-white/[0.05] transition-colors mb-6"
      >
        <IconBrandGoogle size={18} stroke={1.5} />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-border-auth" />
        <span className="text-xs text-zinc-600">or</span>
        <div className="flex-1 h-px bg-border-auth" />
      </div>

      {/* Email form */}
      <form onSubmit={handleEmailContinue}>
        <label className="block text-xs text-zinc-500 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-panel-auth-input border border-border-auth rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-accent/50 transition-colors mb-4"
        />

        <button
          type="submit"
          disabled={!email || loading}
          className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Continue with email
        </button>
      </form>

      {/* Footer */}
      <p className="text-xs text-zinc-600 mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
