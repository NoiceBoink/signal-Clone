"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ShieldCheck, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim() || !phone.trim() || !password) {
      if (!phone.trim()) {
        setError("Phone number is required to register");
      }
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Phone number is required");
      setStep(1);
      return;
    }
    if (otp.trim() !== "123456") {
      setError("Invalid OTP. The test code is 123456.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First verify mock OTP
      await api.verifyOtp({ phone: phone.trim(), otp: "123456" });

      // Then register user
      await register({
        username: username.trim(),
        phone: phone.trim(),
        display_name: displayName.trim(),
        password,
      });

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Signal Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 relative mb-3 transition-transform hover:scale-105">
            <Image
              src="/signal-logo.svg"
              alt="Signal"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {step === 1 ? "Set up Signal" : "Verify Your Number"}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {step === 1
              ? "Create your privacy-focused messaging account"
              : "Enter the 6-digit verification code to activate your account"}
          </p>
        </div>

        {step === 1 ? (
          /* STEP 1: Account Credentials */
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jdoe"
                required
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--signal-ultramarine)] text-sm rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                Display Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--signal-ultramarine)] text-sm rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555-0199 or +91 98765 43210"
                required
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--signal-ultramarine)] text-sm rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--signal-ultramarine)] text-sm rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden transition-colors"
              />
            </div>

            {error && (
              <div className="text-xs text-red-500 font-medium bg-red-500/10 px-3.5 py-2.5 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[var(--signal-ultramarine)] hover:bg-[var(--signal-ultramarine-hover)] text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: Mock OTP Verification */
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div className="bg-[var(--signal-ultramarine-pale)] text-[var(--signal-ultramarine)] p-3 rounded-2xl flex items-center gap-2.5 text-xs">
              <KeyRound className="w-5 h-5 shrink-0" />
              <div>
                Mock verification code for <span className="font-semibold">{phone}</span> is <span className="font-bold">123456</span>.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                6-digit verification code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                autoFocus
                required
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--signal-ultramarine)] text-center tracking-widest text-lg font-mono rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => setOtp("123456")}
              className="w-full text-xs text-[var(--signal-ultramarine)] hover:underline font-semibold text-center"
            >
              Auto-fill &ldquo;123456&rdquo;
            </button>

            {error && (
              <div className="text-xs text-red-500 font-medium bg-red-500/10 px-3.5 py-2.5 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-full border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-sm font-semibold transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-full bg-[var(--signal-ultramarine)] hover:bg-[var(--signal-ultramarine-hover)] disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {isLoading ? "Creating account..." : "Complete Setup"}
              </button>
            </div>
          </form>
        )}

        {/* Back to Login link */}
        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--signal-ultramarine)] hover:underline font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

