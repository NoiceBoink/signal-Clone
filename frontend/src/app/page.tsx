"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useAppStore } from "@/lib/store";
import { NavSidebar } from "@/components/NavSidebar";
import { ChatListSidebar } from "@/components/ChatListSidebar";
import { ChatArea } from "@/components/ChatArea";
import { StoriesPane } from "@/components/stories/StoriesPane";
import { NewChatModal } from "@/components/modals/NewChatModal";
import { NewGroupModal } from "@/components/modals/NewGroupModal";
import { AddContactModal } from "@/components/modals/AddContactModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { CallModal } from "@/components/modals/CallModal";
import { KeyboardShortcutsModal } from "@/components/modals/KeyboardShortcutsModal";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SettingsView } from "@/components/settings/SettingsView";

export default function SignalApp() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const {
    activeConversationId,
    setActiveConversationId,
    isNewChatOpen,
    setIsNewChatOpen,
    isNewGroupOpen,
    setIsNewGroupOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isKeyboardShortcutsOpen,
    setIsKeyboardShortcutsOpen,
    toggleArchiveConversation,
    markConversationUnread,
    selectNextConversation,
    selectPrevConversation,
    selectConversationByIndex,
  } = useAppStore();

  const [isNavRailCollapsed, setIsNavRailCollapsed] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<"chats" | "calls" | "stories" | "settings">("chats");

  // Whenever a chat conversation is opened, ensure activeNavTab switches to "chats" so chats icon is filled
  const prevActiveConvId = useRef(activeConversationId);
  useEffect(() => {
    if (activeConversationId && activeConversationId !== prevActiveConvId.current) {
      setActiveNavTab("chats");
    }
    prevActiveConvId.current = activeConversationId;
  }, [activeConversationId]);

  // Sync isSettingsOpen from dropdown menus with full settings view
  useEffect(() => {
    if (isSettingsOpen) {
      setActiveNavTab("settings");
      setIsSettingsOpen(false);
    }
  }, [isSettingsOpen, setIsSettingsOpen]);

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Global Signal Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;
      const key = e.key.toLowerCase();

      // 1. Show Keyboard Shortcuts: Ctrl + / (or Cmd + /) or ?
      if (isCtrlOrCmd && (key === "/" || e.key === "?")) {
        e.preventDefault();
        setIsKeyboardShortcutsOpen(!isKeyboardShortcutsOpen);
        return;
      }

      // 2. Open Preferences / Settings: Ctrl + , (or Cmd + ,)
      if (isCtrlOrCmd && key === ",") {
        e.preventDefault();
        setActiveNavTab("settings");
        return;
      }

      // 3. New Conversation: Ctrl + N (without Shift)
      if (isCtrlOrCmd && !isShift && key === "n") {
        e.preventDefault();
        setIsNewChatOpen(true);
        return;
      }

      // 4. New Group: Ctrl + Shift + N
      if (isCtrlOrCmd && isShift && key === "n") {
        e.preventDefault();
        setIsNewGroupOpen(true);
        return;
      }

      // 5. Focus Search: Ctrl + F (without Shift)
      if (isCtrlOrCmd && !isShift && key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          '#sidebar-search-input, input[data-testid="sidebar-search-input"], input[placeholder="Search"], input[placeholder="Search chat"]'
        );
        searchInput?.focus();
        searchInput?.select();
        return;
      }

      // 6. Close Conversation: Ctrl + Shift + C
      if (isCtrlOrCmd && isShift && (key === "c" || e.code === "KeyC")) {
        e.preventDefault();
        setActiveConversationId(null);
        return;
      }

      // 7. Archive Conversation: Ctrl + Shift + A
      if (isCtrlOrCmd && isShift && key === "a") {
        e.preventDefault();
        if (activeConversationId) {
          toggleArchiveConversation(activeConversationId);
        }
        return;
      }

      // 8. Mark as Unread: Ctrl + Shift + U
      if (isCtrlOrCmd && isShift && key === "u") {
        e.preventDefault();
        if (activeConversationId) {
          markConversationUnread(activeConversationId);
        }
        return;
      }

      // 9. Toggle Navigation Rail / Sidebar: Ctrl + B
      if (isCtrlOrCmd && !isShift && key === "b") {
        e.preventDefault();
        setIsNavRailCollapsed((prev) => !prev);
        return;
      }

      // 10. Next Conversation: Alt + Down or (Ctrl + Tab without Shift)
      if ((isAlt && e.key === "ArrowDown") || (isCtrlOrCmd && !isShift && e.key === "Tab")) {
        e.preventDefault();
        selectNextConversation();
        return;
      }

      // 11. Previous Conversation: Alt + Up or (Ctrl + Shift + Tab)
      if ((isAlt && e.key === "ArrowUp") || (isCtrlOrCmd && isShift && e.key === "Tab")) {
        e.preventDefault();
        selectPrevConversation();
        return;
      }

      // 12. Jump to Chat 1-9: Ctrl + 1 through Ctrl + 9 (or Alt + 1-9)
      if ((isCtrlOrCmd || isAlt) && !isShift && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const num = parseInt(e.key, 10);
        selectConversationByIndex(num - 1);
        return;
      }

      // 13. Escape: Close modals, deselect chat, or clear focus
      if (e.key === "Escape") {
        if (isKeyboardShortcutsOpen) {
          setIsKeyboardShortcutsOpen(false);
          return;
        }
        if (isNewGroupOpen) {
          setIsNewGroupOpen(false);
          return;
        }
        if (isNewChatOpen) {
          setIsNewChatOpen(false);
          return;
        }
        if (activeConversationId && window.innerWidth < 768) {
          setActiveConversationId(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isKeyboardShortcutsOpen,
    setIsKeyboardShortcutsOpen,
    isNewChatOpen,
    setIsNewChatOpen,
    isNewGroupOpen,
    setIsNewGroupOpen,
    activeConversationId,
    setActiveConversationId,
    toggleArchiveConversation,
    markConversationUnread,
    selectNextConversation,
    selectPrevConversation,
    selectConversationByIndex,
  ]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center select-none">
        <div className="w-16 h-16 relative mb-4 animate-pulse">
          <Image
            src="/signal-logo.svg"
            alt="Signal Loading"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-sm font-semibold text-[var(--text-secondary)]">
          Starting Signal...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Main Signal Desktop Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Leftmost 54px Nav Rail (Collapses when hamburger is clicked) */}
        {!isNavRailCollapsed && (
          <NavSidebar
            isSidebarCollapsed={isNavRailCollapsed}
            onToggleSidebarCollapse={() => setIsNavRailCollapsed(true)}
            activeNavTab={activeNavTab}
            onSelectNavTab={(tab) => setActiveNavTab(tab)}
          />
        )}

        {/* Second Column: Chats, Stories, or Settings (Stays open when rail collapses) */}
        <div
          className={`${
            activeConversationId && activeNavTab === "chats" ? "hidden md:flex" : "flex"
          } h-full shrink-0`}
        >
          {activeNavTab === "chats" && (
            <ChatListSidebar
              isNavRailCollapsed={isNavRailCollapsed}
              onToggleNavRail={() => setIsNavRailCollapsed(!isNavRailCollapsed)}
            />
          )}
          {activeNavTab === "stories" && <StoriesPane />}
          {activeNavTab === "settings" && (
            <SettingsSidebar
              isNavRailCollapsed={isNavRailCollapsed}
              onToggleNavRail={() => setIsNavRailCollapsed(!isNavRailCollapsed)}
            />
          )}
        </div>

        {/* Main Column: Chat Area or Settings View */}
        <div
          className={`${
            activeConversationId || activeNavTab === "settings" ? "flex" : "hidden md:flex"
          } flex-1 h-full min-w-0`}
        >
          {activeNavTab === "settings" ? (
            <SettingsView />
          ) : (
            <ChatArea onBack={() => setActiveConversationId(null)} />
          )}
        </div>
      </div>

      {/* Modals Container */}
      <NewChatModal />
      <NewGroupModal />
      <AddContactModal />
      <SettingsModal />
      <CallModal />
      <KeyboardShortcutsModal />
    </div>
  );
}
