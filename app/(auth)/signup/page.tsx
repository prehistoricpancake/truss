"use client";

import Link from "next/link";
import { useState, use } from "react";
import { IconBrandGoogle, IconCheck, IconX } from "@tabler/icons-react";

type Step = "email" | "password" | "verify";

export default function SignupPage(props: {
  searchParams: Promise<{ email?: string; mode?: string }>;
}) {
  const searchParams = use(props.searchParams);
  const [step, setStep] = useState<Step>(searchParams.email ? "password" : "email");
  const [email, setEmail] = useState(searchParams.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordChecks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Upper & lower case", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "At least 1 number", met: /\d/.test(password) },
    { label: "No leading/trailing spaces", met: password.length > 0 && password === password.trim() },
    { label: "Passwords match", met: password.length > 0 && password === confirmPassword },
  ];

  const allChecksPassed = passwordChecks.every((c) => c.met);

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/signin/cognito";
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep("password");
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecksPassed) return;
    setLoading(true);
    setError("");

    try {
      // Real Cognito signup via cognito.ts
      const { signUp } = await import("@/lib/cognito");
      await signUp(email, password);
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { confirmSignUp } = await import("@/lib/cognito");
      await confirmSignUp(email, verificationCode);
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
      setError(err instanceof Error ? err.message : "Failed to resend code");
    }
  };

  return (
    <>
      {/* Wordmark */}
      <Link href="/" className="text-xl font-semibold text-white tracking-tight mb-10">
        truss
      </Link>

      {step === "email" && (
        <>
          <h2 className="text-2xl font-semibold text-white mb-1">Create your account</h2>
          <p className="text-sm text-zinc-500 mb-8">Get started with Truss</p>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center gap-3 px-4 py-3 bg-panel-auth-input border border-border-auth rounded-lg text-sm text-zinc-300 hover:bg-white/[0.05] transition-colors mb-6"
          >
            <IconBrandGoogle size={18} stroke={1.5} />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border-auth" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="flex-1 h-px bg-border-auth" />
          </div>

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
              disabled={!email}
              className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Continue
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
        </>
      )}

      {step === "password" && (
        <>
          <h2 className="text-2xl font-semibold text-white mb-1">Create your password</h2>
          <p className="text-sm text-zinc-500 mb-8">{email}</p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateAccount}>
            <label className="block text-xs text-zinc-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-3 bg-panel-auth-input border border-border-auth rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-accent/50 transition-colors mb-3"
            />

            <label className="block text-xs text-zinc-500 mb-1.5">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 bg-panel-auth-input border border-border-auth rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-accent/50 transition-colors mb-4"
            />

            {/* Live checklist */}
            <div className="space-y-1.5 mb-6">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-xs">
                  {check.met ? (
                    <IconCheck size={14} className="text-success" />
                  ) : (
                    <IconX size={14} className="text-zinc-600" />
                  )}
                  <span className={check.met ? "text-success" : "text-zinc-600"}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={!allChecksPassed || loading}
              className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? "Creating account\u2026" : "Create account"}
            </button>
          </form>
        </>
      )}

      {step === "verify" && (
        <>
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
            <label className="block text-xs text-zinc-500 mb-1.5">Verification code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 bg-panel-auth-input border border-border-auth rounded-lg text-sm text-white placeholder-zinc-600 outline-none focus:border-accent/50 transition-colors mb-2"
              maxLength={6}
            />

            <button
              type="button"
              onClick={handleResend}
              className="text-xs text-accent hover:underline mb-4 block"
            >
              Resend code
            </button>

            <button
              type="submit"
              disabled={verificationCode.length < 6 || loading}
              className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? "Verifying\u2026" : "Verify and continue"}
            </button>
          </form>
        </>
      )}
    </>
  );
}
