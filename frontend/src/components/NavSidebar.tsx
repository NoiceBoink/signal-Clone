"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import {
  SignalChatIcon,
  SignalPhoneIcon,
  SignalStoriesIcon,
  SignalSettingsIcon,
  SignalMenuIcon,
} from "./SignalIcons";

interface NavSidebarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  activeNavTab: "chats" | "calls" | "stories" | "settings";
  onSelectNavTab: (tab: "chats" | "calls" | "stories" | "settings") => void;
}

export function NavSidebar({
  onToggleSidebarCollapse,
  activeNavTab,
  onSelectNavTab,
}: NavSidebarProps) {
  const { conversations, setIsSettingsOpen, startCall } = useAppStore();

  const totalUnreadCount = conversations.reduce(
    (acc, curr) => acc + (curr.unread_count || 0),
    0
  );

  return (
    <aside
      aria-label="Navigation rail"
      className="w-[54px] shrink-0 bg-[var(--navrail-bg)] border-r border-[var(--border-primary)] flex flex-col items-center py-3 select-none z-30"
    >
      {/* Top Section: Hamburger Toggle & Primary Nav Tabs */}
      <div className="flex flex-col items-center gap-2 w-full">
        {/* Hamburger Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleSidebarCollapse}
          title="Collapse navigation"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <SignalMenuIcon className="w-5 h-5" />
        </button>

        {/* Chats Tab */}
        <div className="relative">
          <button
            type="button"
            onClick={() => onSelectNavTab("chats")}
            title="Chats"
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeNavTab === "chats"
                ? "bg-[#333333] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <SignalChatIcon filled={activeNavTab === "chats"} className="w-5 h-5" />
          </button>
          {totalUnreadCount > 0 && activeNavTab !== "chats" && (
            <span className="absolute -top-1 -right-1 bg-[var(--signal-ultramarine)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-[var(--navrail-bg)] pointer-events-none">
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </span>
          )}
        </div>

        {/* Calls Tab (Disabled / Unclickable, shows 'Coming soon' on hover) */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            disabled
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-secondary)] opacity-60 cursor-default select-none transition-all hover:bg-[var(--bg-hover)]/50"
          >
            <SignalPhoneIcon filled={false} className="w-5 h-5" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
            Coming soon
          </div>
        </div>

        {/* Stories Tab (Disabled / Unclickable, shows 'Coming soon' on hover) */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            disabled
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-secondary)] opacity-60 cursor-default select-none transition-all hover:bg-[var(--bg-hover)]/50"
          >
            <SignalStoriesIcon filled={false} className="w-5 h-5" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
            Coming soon
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Section: Settings */}
      <div className="flex flex-col items-center w-full">
        <button
          type="button"
          onClick={() => onSelectNavTab("settings")}
          title="Settings"
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            activeNavTab === "settings"
              ? "bg-[#333333] text-white shadow-xs"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          <SignalSettingsIcon filled={activeNavTab === "settings"} className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
