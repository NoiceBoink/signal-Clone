"use client";

import React from "react";
import { useAuth } from "@/lib/auth";
import { useAppStore, SettingsTabId } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import {
  SignalMenuIcon,
  SignalSettingsGeneralIcon,
  SignalSettingsAppearanceIcon,
  SignalSettingsChatIcon,
  SignalSettingsCallIcon,
  SignalSettingsBellIcon,
  SignalSettingsLockIcon,
  SignalSettingsDataIcon,
  SignalSettingsBackupIcon,
  SignalSettingsHeartIcon,
} from "@/components/SignalIcons";

interface SettingsSidebarProps {
  isNavRailCollapsed?: boolean;
  onToggleNavRail?: () => void;
}

export function SettingsSidebar({
  isNavRailCollapsed,
  onToggleNavRail,
}: SettingsSidebarProps) {
  const { user } = useAuth();
  const { activeSettingsTab, setActiveSettingsTab } = useAppStore();

  const settingsItems: {
    id: SettingsTabId;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "general",
      label: "General",
      icon: <SignalSettingsGeneralIcon className="w-5 h-5" />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <SignalSettingsAppearanceIcon className="w-5 h-5" />,
    },
    {
      id: "chats",
      label: "Chats",
      icon: <SignalSettingsChatIcon className="w-5 h-5" />,
    },
    {
      id: "calls",
      label: "Calls",
      icon: <SignalSettingsCallIcon className="w-5 h-5" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <SignalSettingsBellIcon className="w-5 h-5" />,
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: <SignalSettingsLockIcon className="w-5 h-5" />,
    },
    {
      id: "data_usage",
      label: "Data usage",
      icon: <SignalSettingsDataIcon className="w-5 h-5" />,
    },
    {
      id: "backups",
      label: "Backups",
      icon: <SignalSettingsBackupIcon className="w-5 h-5" />,
    },
    {
      id: "donate",
      label: "Donate to Signal",
      icon: <SignalSettingsHeartIcon className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      aria-label="Settings navigation"
      className="w-[320px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] flex flex-col h-full select-none"
    >
      {/* Top Header */}
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isNavRailCollapsed && onToggleNavRail && (
            <button
              type="button"
              onClick={onToggleNavRail}
              title="Expand navigation"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <SignalMenuIcon className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Settings
          </h1>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5 custom-scrollbar">
        {/* Profile Card Header */}
        {user && (
          <button
            type="button"
            onClick={() => setActiveSettingsTab("profile")}
            className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-colors text-left ${
              activeSettingsTab === "profile"
                ? "bg-[var(--bg-hover)] text-[var(--text-primary)] shadow-xs"
                : "hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
            }`}
          >
            <Avatar
              name={user.display_name}
              color={user.avatar_color}
              initials={user.initials}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate text-[var(--text-primary)]">
                {user.display_name}
              </div>
              <div className="text-xs text-[var(--text-secondary)] truncate">
                {user.phone || `@${user.username}`}
              </div>
            </div>
          </button>
        )}

        <div className="pt-2 space-y-0.5">
          {settingsItems.map((item) => {
            const isActive = activeSettingsTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSettingsTab(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3.5 transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <span className={isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

