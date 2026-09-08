"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      await login({ username: username.trim(), password });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
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
            Signal for Desktop
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Sign in to start messaging with privacy
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. demo"
              required
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--signal-ultramarine)] text-sm rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
              Password
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
            disabled={isLoading}
            className="w-full py-2.5 rounded-full bg-[var(--signal-ultramarine)] hover:bg-[var(--signal-ultramarine-hover)] disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[var(--signal-ultramarine)] hover:underline font-semibold"
          >
            Set up Signal
          </Link>
        </div>
      </div>
    </div>
  );
}

