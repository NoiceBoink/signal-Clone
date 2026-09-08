"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Conversation } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import { Avatar } from "./Avatar";
import {
  SignalStopwatchIcon,
  SignalMuteBellIcon,
  SignalChatGearIcon,
  SignalAllMediaIcon,
  SignalCheckmarkCircleIcon,
  SignalMarkUnreadIcon,
  SignalPinChatIcon,
  SignalArchiveBoxIcon,
  SignalProhibitionIcon,
  SignalDeleteTrashIcon,
} from "./SignalIcons";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack?: () => void;
}

// Authentic Signal Desktop Header Icons
function VideoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.636 3.02c-.674 0-1.224 0-1.67.037-.463.038-.878.118-1.265.316a3.23 3.23 0 0 0-1.412 1.411c-.197.387-.277.803-.315 1.265-.037.446-.037.996-.036 1.67v4.562c0 .674 0 1.224.036 1.67.038.462.118.878.315 1.265.31.608.804 1.102 1.412 1.411.387.198.802.278 1.264.316.447.036.997.036 1.671.036h4.145c.674 0 1.224 0 1.67-.036.462-.038.878-.118 1.265-.316a3.229 3.229 0 0 0 1.411-1.41c.198-.388.278-.804.316-1.266.03-.375.035-.824.036-1.357l2.333 2.332c.984.985 2.667.288 2.667-1.104V6.179c0-1.392-1.683-2.09-2.667-1.105l-2.333 2.332c0-.533-.006-.982-.036-1.357-.038-.462-.118-.878-.316-1.265a3.23 3.23 0 0 0-1.411-1.411c-.387-.198-.803-.278-1.265-.316-.446-.036-.996-.036-1.67-.036H5.636Zm7.385 4.73c0-.712 0-1.202-.032-1.583-.03-.371-.086-.573-.161-.72a1.771 1.771 0 0 0-.774-.775c-.148-.075-.35-.13-.721-.161-.38-.031-.87-.032-1.583-.032H5.667c-.712 0-1.203 0-1.583.032-.372.03-.574.086-.721.161a1.77 1.77 0 0 0-.774.774c-.075.148-.131.35-.162.721-.03.38-.031.87-.031 1.583v4.5c0 .712 0 1.202.031 1.583.03.371.087.573.162.721.17.333.44.604.774.774.147.075.35.13.721.161.38.031.87.032 1.583.032H9.75c.712 0 1.202 0 1.583-.032.371-.03.573-.086.72-.161.334-.17.605-.44.775-.774.075-.148.13-.35.161-.721.031-.38.032-.87.032-1.583v-4.5ZM14.479 10c0 .34.135.666.376.907l2.988 2.988c.024.024.041.03.053.031a.112.112 0 0 0 .06-.008.112.112 0 0 0 .05-.037.104.104 0 0 0 .015-.06V6.18a.104.104 0 0 0-.015-.06.112.112 0 0 0-.05-.037.112.112 0 0 0-.06-.008.093.093 0 0 0-.053.03l-2.988 2.989c-.24.24-.376.567-.376.907Z"
      />
    </svg>
  );
}

function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M3.546 2.271a2.42 2.42 0 0 1 3.638.247L8.99 4.896a2.42 2.42 0 0 1-.216 3.175l-.875.876c.027.078.075.187.152.325.229.413.639.95 1.182 1.493.544.544 1.081.954 1.494 1.183.138.077.247.125.325.152l.875-.875a2.42 2.42 0 0 1 3.176-.216l2.378 1.807a2.42 2.42 0 0 1 .247 3.638l-.363.363c-1.308 1.308-3.259 2.025-5.136 1.382a16.727 16.727 0 0 1-6.418-4.011 16.726 16.726 0 0 1-4.01-6.418c-.644-1.877.073-3.828 1.38-5.136l.364-.363Zm2.476 1.13a.962.962 0 0 0-1.445-.098l-.363.363C3.199 4.68 2.76 6.069 3.18 7.298a15.269 15.269 0 0 0 3.662 5.859 15.269 15.269 0 0 0 5.86 3.662c1.228.421 2.617-.018 3.631-1.033l.363-.363a.962.962 0 0 0-.098-1.446l-2.377-1.806a.962.962 0 0 0-1.262.085l-1.035 1.035c-.345.344-.798.318-1.052.269a2.99 2.99 0 0 1-.854-.337c-.56-.312-1.204-.815-1.816-1.426-.611-.612-1.114-1.255-1.426-1.816a2.992 2.992 0 0 1-.337-.854c-.049-.254-.075-.707.269-1.052L7.744 7.04a.962.962 0 0 0 .086-1.262L6.022 3.401Z" />
    </svg>
  );
}

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.333 1.77a6.563 6.563 0 1 0 3.93 11.82l4.158 4.156a.937.937 0 0 0 1.325-1.325l-4.157-4.157A6.563 6.563 0 0 0 8.333 1.77ZM3.23 8.334a5.104 5.104 0 1 1 10.209 0 5.104 5.104 0 0 1-10.209 0Z"
      />
    </svg>
  );
}

function MoreHorizontalIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M4.27 11.354a1.354 1.354 0 1 0 0-2.708 1.354 1.354 0 0 0 0 2.708ZM11.354 10a1.354 1.354 0 1 1-2.708 0 1.354 1.354 0 0 1 2.708 0Zm5.729 0a1.354 1.354 0 1 1-2.708 0 1.354 1.354 0 0 1 2.708 0Z" />
    </svg>
  );
}

const TIMER_OPTIONS = [
  "Off",
  "4 weeks",
  "1 week",
  "1 day",
  "8 hours",
  "1 hour",
  "5 minutes",
  "30 seconds",
];

const MUTE_OPTIONS = [
  "1 hour",
  "8 hours",
  "1 day",
  "7 days",
  "Always",
];

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  const { user } = useAuth();
  const {
    setIsGroupDetailsOpen,
    setIsConversationDetailsOpen,
    startCall,
    pinnedConversationIds,
    togglePinConversation,
    archivedConversationIds,
    toggleArchiveConversation,
    mutedConversations,
    setConversationMuted,
    disappearingTimers,
    setConversationDisappearingTimer,
    blockedUserIds,
    toggleBlockUser,
    markConversationUnread,
    deleteConversation,
    setIsSelectingMessages,
    setIsAllMediaOpen,
    scopedSearchContact,
    setScopedSearch,
  } = useAppStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<"disappearing" | "mute" | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Confirmation Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  const isGroup = conversation.is_group;
  const otherUser = !isGroup
    ? conversation.members?.find((m) => m.id !== user?.id)
    : null;

  const displayName = isGroup
    ? conversation.group_name || "Group Chat"
    : otherUser?.display_name || "Unknown";

  const displayInitials = isGroup
    ? getInitials(displayName)
    : otherUser?.initials || getInitials(displayName);

  const avatarBg = isGroup
    ? conversation.group_avatar_color || "#c9d5ed"
    : otherUser?.avatar_color || "#edd0c9";

  const isPinned = pinnedConversationIds.includes(conversation.id);
  const isArchived = archivedConversationIds.includes(conversation.id);
  const isBlocked = otherUser ? blockedUserIds.includes(otherUser.id) : false;
  const currentDisappearingTimer = disappearingTimers[conversation.id] || "Off";
  const currentMuteDuration = mutedConversations[conversation.id] || null;

  const showToast = (message: string) => {
    setStatusToast(message);
    setTimeout(() => setStatusToast(null), 2500);
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
        setActiveSubmenu(null);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleOpenDetails = () => {
    setIsMenuOpen(false);
    setActiveSubmenu(null);
    setIsConversationDetailsOpen(true);
  };

  return (
    <div className="h-[52px] px-4 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] flex items-center justify-between select-none z-10 relative">
      {/* Toast Alert */}
      {statusToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#2a2a2a] border border-[#3e3e3e] text-neutral-100 text-xs px-4 py-1.5 rounded-full shadow-lg z-50 animate-in fade-in duration-150">
          {statusToast}
        </div>
      )}

      {/* Left: Avatar & Contact Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] mr-1 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          data-testid="chat-header-profile"
          onClick={handleOpenDetails}
          className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-90 group"
        >
          {/* Avatar without online dot indicator */}
          <Avatar
            name={displayName}
            color={avatarBg}
            initials={displayInitials}
            avatarUrl={otherUser?.avatar_url}
            isGroup={isGroup}
            size="sm"
            className="w-9 h-9 shrink-0 cursor-pointer"
          />

          {/* Name ONLY - cleanly vertically aligned */}
          <div className="flex items-center min-w-0">
            <span className="text-[15px] font-bold text-[var(--text-primary)] truncate">
              {displayName}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions [Video] [Phone] [Search] [More Options] */}
      <div className="flex items-center gap-2 shrink-0 text-[var(--text-secondary)]">
        {/* Video Call (Disabled / Coming soon) */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            disabled
            aria-label="Video Call"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] opacity-60 cursor-default select-none transition-colors"
          >
            <VideoIcon className="w-5 h-5" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
            Coming soon
          </div>
        </div>

        {/* Voice Call (Disabled / Coming soon) */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            disabled
            aria-label="Voice Call"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] opacity-60 cursor-default select-none transition-colors"
          >
            <PhoneIcon className="w-5 h-5" />
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
            Coming soon
          </div>
        </div>

        {/* Search in conversation (Scoped search in sidebar) */}
        <button
          type="button"
          onClick={() => {
            if (scopedSearchContact?.id === otherUser?.id) {
              setScopedSearch(null, null);
            } else if (otherUser) {
              setScopedSearch(otherUser, conversation.id);
            } else {
              setScopedSearch(null, conversation.id);
            }
          }}
          title="Search in conversation"
          className={`w-9 h-9 rounded-lg flex items-center justify-center hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer ${
            (otherUser && scopedSearchContact?.id === otherUser.id)
              ? "text-[var(--signal-ultramarine)] bg-[var(--bg-hover)]"
              : ""
          }`}
        >
          <SearchIcon className="w-5 h-5" />
        </button>

        {/* More Options (Three horizontal dots) */}
        <div className="relative" ref={menuContainerRef}>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setActiveSubmenu(null);
            }}
            title="More Options"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isMenuOpen
                ? "bg-[#2a2a2a] text-white"
                : "hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <MoreHorizontalIcon className="w-5 h-5" />
          </button>

          {/* Authentic Signal Desktop Dropdown Menu */}
          {isMenuOpen && (
            <div
              style={{ width: "235px", backgroundColor: "#202020" }}
              className="signal-dropdown-menu absolute right-0 top-full mt-1.5 border border-[#333333] rounded-2xl shadow-2xl p-1.5 z-50 select-none text-[#f0f0f0]"
            >
              {/* Item 1: Disappearing messages > */}
              <div
                className="relative"
                onMouseEnter={() => setActiveSubmenu("disappearing")}
              >
                <div
                  onClick={() =>
                    setActiveSubmenu(
                      activeSubmenu === "disappearing" ? null : "disappearing"
                    )
                  }
                  className={`flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl cursor-pointer transition-colors ${
                    activeSubmenu === "disappearing"
                      ? "bg-[#2e2e2e]"
                      : "hover:bg-[#2e2e2e]"
                  }`}
                >
                  <SignalStopwatchIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                  <span className="flex-1 text-left">Disappearing messages</span>
                  <ChevronRight className="w-4 h-4 text-[#8e8e93] shrink-0 stroke-[2]" />
                </div>

                {/* Disappearing Submenu Flyout (Left) */}
                {activeSubmenu === "disappearing" && (
                  <div
                    onMouseEnter={() => setActiveSubmenu("disappearing")}
                    onMouseLeave={() => setActiveSubmenu(null)}
                    style={{
                      right: "calc(100% + 4px)",
                      top: "-4px",
                      width: "175px",
                      backgroundColor: "#202020",
                    }}
                    className="signal-dropdown-menu absolute border border-[#333333] rounded-2xl shadow-2xl p-1.5 z-50 before:absolute before:-right-2 before:top-0 before:bottom-0 before:w-2"
                  >
                    {TIMER_OPTIONS.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setConversationDisappearingTimer(conversation.id, opt);
                          setIsMenuOpen(false);
                          setActiveSubmenu(null);
                          showToast(
                            opt === "Off"
                              ? "Disappearing messages turned off"
                              : `Timer set to ${opt}`
                          );
                        }}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] cursor-pointer hover:bg-[#2e2e2e] transition-colors ${
                          currentDisappearingTimer === opt
                            ? "text-[var(--signal-ultramarine)] font-medium"
                            : "text-[#f0f0f0]"
                        }`}
                      >
                        <span>{opt}</span>
                        {currentDisappearingTimer === opt && (
                          <Check className="w-4 h-4 text-[var(--signal-ultramarine)] stroke-[2.5]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Item 2: Mute notifications > */}
              <div
                className="relative"
                onMouseEnter={() => setActiveSubmenu("mute")}
              >
                <div
                  onClick={() =>
                    setActiveSubmenu(activeSubmenu === "mute" ? null : "mute")
                  }
                  className={`flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl cursor-pointer transition-colors ${
                    activeSubmenu === "mute"
                      ? "bg-[#2e2e2e]"
                      : "hover:bg-[#2e2e2e]"
                  }`}
                >
                  <SignalMuteBellIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                  <span className="flex-1 text-left">Mute notifications</span>
                  <ChevronRight className="w-4 h-4 text-[#8e8e93] shrink-0 stroke-[2]" />
                </div>

                {/* Mute Submenu Flyout (Left) */}
                {activeSubmenu === "mute" && (
                  <div
                    onMouseEnter={() => setActiveSubmenu("mute")}
                    onMouseLeave={() => setActiveSubmenu(null)}
                    style={{
                      right: "calc(100% + 4px)",
                      top: "-4px",
                      width: "175px",
                      backgroundColor: "#202020",
                    }}
                    className="signal-dropdown-menu absolute border border-[#333333] rounded-2xl shadow-2xl p-1.5 z-50 before:absolute before:-right-2 before:top-0 before:bottom-0 before:w-2"
                  >
                    {currentMuteDuration && (
                      <div
                        onClick={() => {
                          setConversationMuted(conversation.id, null);
                          setIsMenuOpen(false);
                          setActiveSubmenu(null);
                          showToast("Notifications unmuted");
                        }}
                        className="flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] text-[#ea4335] hover:bg-[#2e2e2e] cursor-pointer transition-colors mb-1 border-b border-[#333333]/80 pb-1.5"
                      >
                        <span>Unmute notifications</span>
                      </div>
                    )}
                    {MUTE_OPTIONS.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setConversationMuted(conversation.id, opt);
                          setIsMenuOpen(false);
                          setActiveSubmenu(null);
                          showToast(`Notifications muted for ${opt}`);
                        }}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] cursor-pointer hover:bg-[#2e2e2e] transition-colors ${
                          currentMuteDuration === opt
                            ? "text-[var(--signal-ultramarine)] font-medium"
                            : "text-[#f0f0f0]"
                        }`}
                      >
                        <span>{opt}</span>
                        {currentMuteDuration === opt && (
                          <Check className="w-4 h-4 text-[var(--signal-ultramarine)] stroke-[2.5]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Item 3: Chat settings */}
              <div
                onClick={handleOpenDetails}
                onMouseEnter={() => setActiveSubmenu(null)}
                className="flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl hover:bg-[#2e2e2e] cursor-pointer transition-colors"
              >
                <SignalChatGearIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                <span className="flex-1 text-left">Chat settings</span>
              </div>

              {/* Item 4: All media */}
              <div
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveSubmenu(null);
                  setIsAllMediaOpen(true);
                }}
                onMouseEnter={() => setActiveSubmenu(null)}
                className="flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl hover:bg-[#2e2e2e] cursor-pointer transition-colors"
              >
                <SignalAllMediaIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                <span className="flex-1 text-left">All media</span>
              </div>

              {/* Horizontal Divider 1 */}
              <div className="border-t border-[#333333] my-1 mx-1.5" />

              {/* Item 5: Select messages */}
              <div
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveSubmenu(null);
                  setIsSelectingMessages(true);
                }}
                onMouseEnter={() => setActiveSubmenu(null)}
                className="flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl hover:bg-[#2e2e2e] cursor-pointer transition-colors"
              >
                <SignalCheckmarkCircleIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                <span className="flex-1 text-left">Select messages</span>
              </div>

              {/* Horizontal Divider 2 */}
              <div className="border-t border-[#333333] my-1 mx-1.5" />

              {/* Item 6: Mark as unread */}
              <div
                onClick={() => {
                  markConversationUnread(conversation.id);
                  setIsMenuOpen(false);
                  setActiveSubmenu(null);
                  showToast("Marked as unread");
                }}
                onMouseEnter={() => setActiveSubmenu(null)}
                className="flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl hover:bg-[#2e2e2e] cursor-pointer transition-colors"
              >
                <SignalMarkUnreadIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                <span className="flex-1 text-left">Mark as unread</span>
              </div>

              {/* Item 7: Pin chat */}
              <div
                onClick={() => {
                  togglePinConversation(conversation.id);
                  setIsMenuOpen(false);
                  setActiveSubmenu(null);
                  showToast(isPinned ? "Chat unpinned" : "Chat pinned");
                }}
                onMouseEnter={() => setActiveSubmenu(null)}
                className="flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl hover:bg-[#2e2e2e] cursor-pointer transition-colors"
              >
                <SignalPinChatIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                <span className="flex-1 text-left">
                  {isPinned ? "Unpin chat" : "Pin chat"}
                </span>
              </div>

              {/* Item 8: Archive */}
              <div
                onClick={() => {
                  toggleArchiveConversation(conversation.id);
                  setIsMenuOpen(false);
                  setActiveSubmenu(null);
                  showToast(isArchived ? "Chat unarchived" : "Chat archived");
                }}
                onMouseEnter={() => setActiveSubmenu(null)}
                className="flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl hover:bg-[#2e2e2e] cursor-pointer transition-colors"
              >
                <SignalArchiveBoxIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                <span className="flex-1 text-left">
                  {isArchived ? "Unarchive" : "Archive"}
                </span>
              </div>

              {/* Item 9: Block */}
              <div
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveSubmenu(null);
                  setIsBlockModalOpen(true);
                }}
                onMouseEnter={() => setActiveSubmenu(null)}
                className="flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl hover:bg-[#2e2e2e] cursor-pointer transition-colors"
              >
                <SignalProhibitionIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                <span className="flex-1 text-left">
                  {isBlocked ? "Unblock" : "Block"}
                </span>
              </div>

              {/* Item 10: Delete */}
              <div
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveSubmenu(null);
                  setIsDeleteModalOpen(true);
                }}
                onMouseEnter={() => setActiveSubmenu(null)}
                className="flex items-center w-full px-3 py-2 text-[13.5px] font-normal rounded-xl hover:bg-[#2e2e2e] cursor-pointer transition-colors"
              >
                <SignalDeleteTrashIcon className="w-[18px] h-[18px] text-[#e0e0e0] shrink-0 mr-3" />
                <span className="flex-1 text-left">Delete</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#242424] border border-[#383838] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100 select-none">
            <h3 className="text-base font-bold text-white mb-2">Delete conversation?</h3>
            <p className="text-xs text-neutral-300 mb-5 leading-relaxed">
              This will permanently delete this conversation and all of its messages from your device.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-[#333333] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConversation(conversation.id);
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#ea4335] hover:bg-[#d9382b] text-white cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#242424] border border-[#383838] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100 select-none">
            <h3 className="text-base font-bold text-white mb-2">
              {isBlocked ? `Unblock ${displayName}?` : `Block ${displayName}?`}
            </h3>
            <p className="text-xs text-neutral-300 mb-5 leading-relaxed">
              {isBlocked
                ? "You will be able to receive messages and calls from them again."
                : "Blocked contacts will no longer be able to call you or send you messages."}
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-[#333333] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (otherUser) toggleBlockUser(otherUser.id);
                  setIsBlockModalOpen(false);
                  showToast(isBlocked ? "Contact unblocked" : "Contact blocked");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-medium text-white cursor-pointer transition-colors ${
                  isBlocked
                    ? "bg-[var(--signal-ultramarine)] hover:brightness-110"
                    : "bg-[#ea4335] hover:bg-[#d9382b]"
                }`}
              >
                {isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
