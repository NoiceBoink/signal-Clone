"use client";

import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";

export function AddContactModal() {
  const { isAddContactOpen, setIsAddContactOpen, loadContacts } = useAppStore();

  const [inputVal, setInputVal] = useState("");
  const [mode, setMode] = useState<"username" | "phone">("username");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isAddContactOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (mode === "username") {
        await api.addContact({ username: inputVal.trim() });
      } else {
        await api.addContact({ phone: inputVal.trim() });
      }

      await loadContacts();
      setSuccess(true);
      setTimeout(() => {
        setIsAddContactOpen(false);
        setInputVal("");
        setSuccess(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to add contact");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[var(--signal-ultramarine)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Add contact
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAddContactOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex rounded-xl bg-[var(--bg-secondary)] p-1 mb-4 border border-[var(--border-primary)]">
            <button
              type="button"
              onClick={() => {
                setMode("username");
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === "username"
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Username
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("phone");
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === "phone"
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Phone number
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
              {mode === "username" ? "Username" : "Phone number"}
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={mode === "username" ? "e.g. rahul" : "e.g. 091000 00001"}
              autoFocus
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-[var(--signal-ultramarine)] text-sm rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
            />
          </div>

          {error && (
            <div className="mb-4 text-xs text-red-500 font-medium bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-3 py-2 rounded-lg">
              Contact added successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="w-full py-2.5 rounded-full bg-[var(--signal-ultramarine)] hover:bg-[var(--signal-ultramarine-hover)] disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-xs"
          >
            {isLoading ? "Adding..." : "Add to Contacts"}
          </button>
        </form>
      </div>
    </div>
  );
}

