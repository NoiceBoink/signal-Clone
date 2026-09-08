"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  User as UserIcon,
  Moon,
  Sun,
  Shield,
  Bell,
  Smartphone,
  Info,
  LogOut,
  QrCode,
  Check,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Avatar } from "../Avatar";

type SettingsTab =
  | "profile"
  | "appearance"
  | "privacy"
  | "notifications"
  | "linked_devices"
  | "about";

export function SettingsModal() {
  const { user, logout } = useAuth();
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);

  if (!isSettingsOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px] animate-in zoom-in-95 duration-150">
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-56 bg-[var(--bg-secondary)] border-b md:border-b-0 md:border-r border-[var(--border-primary)] p-3 flex flex-col select-none">
          <div className="px-3 py-2 text-base font-bold text-[var(--text-primary)]">
            Preferences
          </div>

          <div className="flex-1 space-y-1 mt-2">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeTab === "profile"
                  ? "bg-[var(--signal-ultramarine)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("appearance")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeTab === "appearance"
                  ? "bg-[var(--signal-ultramarine)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span>Appearance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("privacy")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeTab === "privacy"
                  ? "bg-[var(--signal-ultramarine)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Privacy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeTab === "notifications"
                  ? "bg-[var(--signal-ultramarine)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("linked_devices")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeTab === "linked_devices"
                  ? "bg-[var(--signal-ultramarine)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Linked Devices</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("about")}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                activeTab === "about"
                  ? "bg-[var(--signal-ultramarine)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </button>
          </div>

          {/* Logout button at bottom */}
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to log out?")) {
                logout();
                setIsSettingsOpen(false);
              }
            }}
            className="w-full px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors mt-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between select-none">
            <h3 className="text-sm font-bold capitalize text-[var(--text-primary)]">
              {activeTab.replace("_", " ")}
            </h3>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Panes */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6 max-w-sm">
                <div className="flex items-center gap-4">
                  <Avatar
                    name={user.display_name}
                    color={user.avatar_color}
                    initials={user.initials}
                    size="xl"
                  />
                  <div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">
                      {user.display_name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      @{user.username}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                      Display Name
                    </label>
                    <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-xs font-medium text-[var(--text-primary)] border border-[var(--border-primary)]">
                      {user.display_name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                      Username
                    </label>
                    <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-xs font-medium text-[var(--text-primary)] border border-[var(--border-primary)]">
                      @{user.username}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                      Phone Number
                    </label>
                    <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-xs font-medium text-[var(--text-primary)] border border-[var(--border-primary)]">
                      {user.phone || "Not set"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Theme
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mb-4">
                    Choose the visual style for Signal Desktop.
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div
                      onClick={() => setTheme("light")}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        theme === "light"
                          ? "border-[var(--signal-ultramarine)] bg-blue-50/50"
                          : "border-[var(--border-primary)] hover:border-[var(--border-secondary)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Sun className="w-5 h-5 text-amber-500" />
                        {theme === "light" && (
                          <Check className="w-4 h-4 text-[var(--signal-ultramarine)]" />
                        )}
                      </div>
                      <div className="text-sm font-semibold text-zinc-900">
                        Light
                      </div>
                      <div className="text-xs text-zinc-500">
                        Clean white interface
                      </div>
                    </div>

                    <div
                      onClick={() => setTheme("dark")}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        theme === "dark"
                          ? "border-[var(--signal-ultramarine)] bg-blue-950/20"
                          : "border-[var(--border-primary)] hover:border-[var(--border-secondary)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Moon className="w-5 h-5 text-indigo-400" />
                        {theme === "dark" && (
                          <Check className="w-4 h-4 text-[var(--signal-ultramarine)]" />
                        )}
                      </div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        Dark
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Easy on the eyes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === "privacy" && (
              <div className="space-y-5 max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      Read Receipts
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      If turned off, you won&apos;t be able to see read receipts from others.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    className="w-4 h-4 accent-[var(--signal-ultramarine)] rounded-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      Typing Indicators
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      If turned off, you won&apos;t be able to see typing indicators from others.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={typingIndicators}
                    onChange={(e) => setTypingIndicators(e.target.checked)}
                    className="w-4 h-4 accent-[var(--signal-ultramarine)] rounded-sm"
                  />
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-5 max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      Message Audio Sounds
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Play incoming chime and sent pop audio effects.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[var(--signal-ultramarine)] rounded-sm"
                  />
                </div>
              </div>
            )}

            {/* LINKED DEVICES TAB */}
            {activeTab === "linked_devices" && (
              <div className="flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center mb-4 text-[var(--signal-ultramarine)]">
                  <QrCode className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
                  Link your phone
                </h4>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mb-4">
                  Scan QR code with your Signal mobile app to link devices. (Coming Soon placeholder)
                </p>
                <div className="text-[11px] text-[var(--signal-ultramarine)] font-semibold bg-[var(--signal-ultramarine-pale)] px-3 py-1 rounded-full">
                  Placeholder Section
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <div className="space-y-4 max-w-md select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 relative">
                    <Image
                      src="/signal-logo.svg"
                      alt="Signal"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-base font-bold text-[var(--text-primary)]">
                      Signal Desktop Clone
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Version 7.42.0 • SDE Fullstack Assignment
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  A high-fidelity clone of the Signal messaging application, replicating the clean privacy-first UX, real-time message delivery, receipts, and group collaboration.
                </p>

                <div className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-primary)]">
                  Built with Next.js, React 19, TypeScript, Tailwind CSS v4, FastAPI, WebSockets, and SQLite.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

