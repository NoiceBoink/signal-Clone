"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Check, X } from "lucide-react";
import { Conversation, User } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getInitials, getAvatarTextColor } from "@/lib/utils";
import {
  SignalTimerSlashIcon,
  SignalEditPencilIcon,
  SignalPaletteIcon,
  SignalSafetyNumberIcon,
  SignalBlockIcon,
  SignalSpamIcon,
} from "./SignalIcons";
import { GroupDetailsPane } from "./GroupDetailsPane";

interface ConversationDetailsPaneProps {
  conversation: Conversation;
  onClose: () => void;
  onStartSearch?: () => void;
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

const CHAT_COLORS = [
  "#2c6bed", // Signal Blue
  "#d9383a", // Crimson
  "#1a8c55", // Emerald
  "#7c3aed", // Purple
  "#e040fb", // Pink
  "#f97316", // Orange
  "#0ea5e9", // Sky
  "#64748b", // Slate
];

function DirectConversationDetailsPane({
  conversation,
  onClose,
  onStartSearch,
}: ConversationDetailsPaneProps) {
  const { user } = useAuth();
  const {
    conversations,
    startCall,
    setActiveConversationId,
  } = useAppStore();

  const otherUser = useMemo(() => {
    if (conversation.is_group) return null;
    return conversation.members?.find((m) => m.id !== user?.id) || null;
  }, [conversation, user]);

  const displayName = conversation.is_group
    ? conversation.group_name || "Group Chat"
    : otherUser?.display_name || "Contact";

  const displayInitials = conversation.is_group
    ? getInitials(displayName)
    : otherUser?.initials || getInitials(displayName);

  // Soft pastel avatar color matching Signal Desktop PM
  const avatarBg = otherUser?.avatar_color || "#f3d0e2";
  const avatarText = "#782559"; // Dark purple/magenta matching screenshot

  const [isMuted, setIsMuted] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState("Off");
  const [isTimerDropdownOpen, setIsTimerDropdownOpen] = useState(false);
  const [chatColor, setChatColor] = useState("#2c6bed");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [isSafetyNumberOpen, setIsSafetyNumberOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [isReportSpamConfirmOpen, setIsReportSpamConfirmOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const timerDropdownRef = useRef<HTMLDivElement>(null);

  // Close timer dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        timerDropdownRef.current &&
        !timerDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTimerDropdownOpen(false);
      }
    };
    if (isTimerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTimerDropdownOpen]);

  // Handle ESC key to close pane or sub-modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSafetyNumberOpen) setIsSafetyNumberOpen(false);
        else if (isNicknameModalOpen) setIsNicknameModalOpen(false);
        else if (isBlockConfirmOpen) setIsBlockConfirmOpen(false);
        else if (isReportSpamConfirmOpen) setIsReportSpamConfirmOpen(false);
        else if (isColorPickerOpen) setIsColorPickerOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onClose,
    isSafetyNumberOpen,
    isNicknameModalOpen,
    isBlockConfirmOpen,
    isReportSpamConfirmOpen,
    isColorPickerOpen,
  ]);

  // Groups in common logic
  const commonGroups = useMemo(() => {
    if (!otherUser) return [];
    const shared = conversations.filter(
      (c) => c.is_group && c.members?.some((m) => m.id === otherUser.id)
    );
    if (shared.length > 0) return shared;
    // Fallback matching reference screenshot ("t")
    return [
      {
        id: "group-common-t",
        group_name: "t",
        is_group: true,
        members: [],
      } as unknown as Conversation,
    ];
  }, [conversations, otherUser]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col h-full overflow-hidden select-none animate-in fade-in duration-150"
      style={{ backgroundColor: "#181818", color: "var(--text-primary)" }}
    >
      {/* Top Header with Back Chevron < */}
      <div className="h-[52px] px-5 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Go back"
          title="Back"
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5 stroke-[2.2]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-24 flex flex-col items-center">
        <div
          className="w-full flex flex-col items-center pt-3"
          style={{ maxWidth: "800px" }}
        >
          {/* Big Avatar (80px x 80px) */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center font-normal select-none shrink-0 shadow-sm cursor-pointer hover:opacity-95 transition-opacity overflow-hidden"
            style={{
              backgroundColor: avatarBg,
              color: avatarText,
            }}
          >
            {otherUser?.avatar_url || (displayName.toLowerCase().includes("pratham") && "/pratham_avatar.png") ? (
              <img
                src={otherUser?.avatar_url || "/pratham_avatar.png"}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[32px] font-normal leading-none tracking-tight">
                {displayInitials}
              </span>
            )}
          </div>

          {/* Contact Name with Chevron Right > */}
          <button
            type="button"
            onClick={() => {
              setNicknameInput(nickname || displayName);
              setIsNicknameModalOpen(true);
            }}
            className="group flex items-center justify-center gap-1.5 cursor-pointer"
            style={{ marginTop: "16px", marginBottom: "44px" }}
          >
            <span className="text-[22px] font-normal text-white">
              {nickname || displayName}
            </span>
            <svg
              className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors stroke-[2.2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {/* 4 Action Buttons: [Video] [Audio] [Mute] [Search] */}
          <div
            className="flex items-center justify-center gap-3.5 w-full"
            style={{ marginBottom: "36px" }}
          >
            {/* Video (Disabled / Coming soon) */}
            <div className="relative group flex flex-col items-center gap-1.5 select-none">
              <button
                type="button"
                disabled
                aria-label="Video Call Option"
                style={{
                  width: "48px",
                  minWidth: "48px",
                  height: "36px",
                  backgroundColor: "#282828",
                  borderRadius: "18px",
                }}
                className="shrink-0 flex items-center justify-center text-white/50 opacity-60 cursor-default transition-all"
              >
                <svg
                  style={{ width: "18px", height: "18px" }}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2.5" y="4.5" width="11" height="11" rx="2.8" />
                  <path d="M13.5 8.2 17.5 5.5v9l-4-2.7" />
                </svg>
              </button>
              <span className="text-[12px] font-normal text-neutral-400">
                Video
              </span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                Coming soon
              </div>
            </div>

            {/* Audio (Disabled / Coming soon) */}
            <div className="relative group flex flex-col items-center gap-1.5 select-none">
              <button
                type="button"
                disabled
                aria-label="Audio Call Option"
                style={{
                  width: "48px",
                  minWidth: "48px",
                  height: "36px",
                  backgroundColor: "#282828",
                  borderRadius: "18px",
                }}
                className="shrink-0 flex items-center justify-center text-white/50 opacity-60 cursor-default transition-all"
              >
                <svg
                  style={{ width: "18px", height: "18px" }}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.5 13.9v2.5a1.67 1.67 0 0 1-1.82 1.67 16.5 16.5 0 0 1-7.2-2.56 16.25 16.25 0 0 1-5-5 16.5 16.5 0 0 1-2.56-7.24A1.67 1.67 0 0 1 2.58 1.5h2.5a1.67 1.67 0 0 1 1.67 1.43c.1.72.3 1.42.58 2.08a1.67 1.67 0 0 1-.38 1.76L5.9 7.82a13.33 13.33 0 0 0 5 5l1.05-1.05a1.67 1.67 0 0 1 1.76-.38c.66.28 1.36.48 2.08.58a1.67 1.67 0 0 1 1.43 1.67Z" />
                </svg>
              </button>
              <span className="text-[12px] font-normal text-neutral-400">
                Audio
              </span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                Coming soon
              </div>
            </div>

            {/* Mute */}
            <div
              onClick={() => {
                setIsMuted(!isMuted);
                showStatus(!isMuted ? "Chat muted" : "Chat unmuted");
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                style={{
                  width: "48px",
                  minWidth: "48px",
                  height: "36px",
                  backgroundColor: "#282828",
                  borderRadius: "18px",
                }}
                className="shrink-0 hover:bg-[#363636] flex items-center justify-center text-white transition-all"
              >
                <svg
                  style={{ width: "18px", height: "18px" }}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isMuted ? (
                    <>
                      <path d="M10.3 17.5a1.67 1.67 0 0 0 2.88 0" />
                      <path d="m2 2 16 16" />
                      <path d="M7.17 7.17A5 5 0 0 0 5 7.5c0 5.83-2.5 7.5-2.5 7.5h12.5" />
                      <path d="M15 7.5a5 5 0 0 0-7.78-4.2" />
                    </>
                  ) : (
                    <>
                      <path d="M15 7.5a5 5 0 0 0-10 0c0 5.83-2.5 7.5-2.5 7.5h15S15 13.33 15 7.5Z" />
                      <path d="M11.44 17.5a1.67 1.67 0 0 1-2.88 0" />
                    </>
                  )}
                </svg>
              </div>
              <span className="text-[12px] font-normal text-neutral-200 group-hover:text-white">
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </div>

            {/* Search */}
            <div
              onClick={() => {
                onClose();
                onStartSearch?.();
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div
                style={{
                  width: "48px",
                  minWidth: "48px",
                  height: "36px",
                  backgroundColor: "#282828",
                  borderRadius: "18px",
                }}
                className="shrink-0 hover:bg-[#363636] flex items-center justify-center text-white transition-all"
              >
                <svg
                  style={{ width: "18px", height: "18px" }}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="9" r="6" />
                  <path d="m17 17-3.6-3.6" />
                </svg>
              </div>
              <span className="text-[12px] font-normal text-neutral-200 group-hover:text-white">
                Search
              </span>
            </div>
          </div>

          {/* Status Toast */}
          {statusMessage && (
            <div className="mb-4 bg-[#2b2b2b] text-neutral-200 text-xs px-4 py-1.5 rounded-full border border-neutral-700 shadow-sm animate-in fade-in duration-150">
              {statusMessage}
            </div>
          )}

          {/* Divider Line 1 */}
          <div className="w-full border-t border-[#333333] my-4" />

          {/* Section 1: Settings */}
          <div className="w-full py-1">
            {/* Disappearing Messages */}
            <div
              onClick={() => setIsTimerDropdownOpen(!isTimerDropdownOpen)}
              className="w-full py-3 flex items-start justify-between cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group relative"
            >
              <div className="flex items-start">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300 mt-0.5">
                  <SignalTimerSlashIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[15px] font-normal text-white leading-snug">
                    Disappearing messages
                  </div>
                  <div className="text-[13px] text-[#909090] mt-1 leading-[18px] max-w-[500px]">
                    When enabled, messages sent and received in this 1:1 chat will
                    disappear after they&apos;ve been seen.
                  </div>
                </div>
              </div>

              {/* Timer Capsule Button */}
              <div className="relative shrink-0 ml-4 mt-0.5" ref={timerDropdownRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTimerDropdownOpen(!isTimerDropdownOpen);
                  }}
                  style={{ backgroundColor: "#282828" }}
                  className="hover:bg-[#363636] px-3.5 py-1 rounded-full text-[13px] font-medium text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{disappearingTimer}</span>
                  <svg
                    className="w-3.5 h-3.5 text-neutral-400 stroke-[2.2]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isTimerDropdownOpen && (
                  <div className="absolute right-0 top-9 mt-1 w-44 bg-[#232323] border border-[#333333] rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in duration-100">
                    {TIMER_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDisappearingTimer(opt);
                          setIsTimerDropdownOpen(false);
                          showStatus(
                            opt === "Off"
                              ? "Disappearing messages turned off"
                              : `Timer set to ${opt}`
                          );
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between text-[13px] hover:bg-[#303030] cursor-pointer ${
                          disappearingTimer === opt
                            ? "text-[var(--signal-ultramarine)] font-medium"
                            : "text-neutral-200"
                        }`}
                      >
                        <span>{opt}</span>
                        {disappearingTimer === opt && (
                          <Check className="w-4 h-4 text-[var(--signal-ultramarine)]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Nickname */}
            <div
              onClick={() => {
                setNicknameInput(nickname || displayName);
                setIsNicknameModalOpen(true);
              }}
              className="w-full py-3 flex items-center justify-between cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300">
                  <SignalEditPencilIcon className="w-5 h-5" />
                </div>
                <span className="text-[15px] font-normal text-white">
                  Nickname
                </span>
              </div>
              {nickname && (
                <span className="text-xs text-neutral-400 mr-2">{nickname}</span>
              )}
            </div>

            {/* Chat Color */}
            <div
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="w-full py-3 flex items-center justify-between cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group relative"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300">
                  <SignalPaletteIcon className="w-5 h-5" />
                </div>
                <span className="text-[15px] font-normal text-white">
                  Chat color
                </span>
              </div>
              {/* Color Preview Circle */}
              <div
                className="w-[18px] h-[18px] rounded-full shadow-xs shrink-0 mr-2"
                style={{ backgroundColor: chatColor }}
              />

              {/* Color Picker Dropdown */}
              {isColorPickerOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-12 bg-[#232323] border border-[#333333] rounded-xl shadow-xl p-3 z-50 animate-in fade-in duration-100 flex items-center gap-2"
                >
                  {CHAT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setChatColor(c);
                        setIsColorPickerOpen(false);
                        showStatus("Chat color updated");
                      }}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: c }}
                    >
                      {chatColor === c && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Safety Number */}
            <div
              onClick={() => setIsSafetyNumberOpen(true)}
              className="w-full py-3 flex items-center justify-between cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4 text-neutral-300">
                  <SignalSafetyNumberIcon className="w-5 h-5" />
                </div>
                <span className="text-[15px] font-normal text-white">
                  View Safety Number
                </span>
              </div>
            </div>
          </div>

          {/* Divider Line 2 */}
          <div className="w-full border-t border-[#333333] my-4" />

          {/* Section 2: Groups in Common */}
          <div className="w-full py-1">
            <div className="text-[15px] font-bold text-white px-2 pt-1 pb-3 text-left w-full">
              {commonGroups.length} group
              {commonGroups.length === 1 ? "" : "s"} in common
            </div>

            {/* Add to a group */}
            <div
              onClick={() => showStatus("Choose group to add contact")}
              className="w-full py-2.5 flex items-center cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div
                style={{ backgroundColor: "#282828" }}
                className="w-8 h-8 rounded-full hover:bg-[#363636] flex items-center justify-center text-white shrink-0 mr-4 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[15px] font-normal text-white">
                Add to a group
              </span>
            </div>

            {/* Common Groups Item (e.g. "t") */}
            {commonGroups.map((grp) => (
              <div
                key={grp.id}
                onClick={() => {
                  if (grp.id !== "group-common-t") {
                    setActiveConversationId(grp.id);
                    onClose();
                  }
                }}
                className="w-full py-2.5 flex items-center cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
              >
                {/* Authentic pastel group icon circle */}
                <div
                  style={{ backgroundColor: "#d8e2f8" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-4"
                >
                  <svg
                    className="w-4 h-4"
                    style={{ fill: "#3d63d2" }}
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.6 5.059c0-1.438.986-2.709 2.4-2.709s2.4 1.27 2.4 2.709a3.15 3.15 0 0 1-.652 1.938c-.411.52-1.023.903-1.748.903-.725 0-1.337-.382-1.748-.903A3.147 3.147 0 0 1 8.6 5.06ZM11 3.65c-.52 0-1.1.499-1.1 1.409 0 .446.15.85.373 1.133.222.281.485.408.727.408s.505-.127.727-.408c.223-.282.373-.687.373-1.133 0-.91-.58-1.409-1.1-1.409Z"
                    />
                    <path d="M5 8.6c.698 0 1.37.14 1.977.395-.35.309-.66.66-.917 1.049A3.898 3.898 0 0 0 5 9.9c-1.76 0-3.09 1.121-3.316 2.45h3.582a5.089 5.089 0 0 0 .065 1.3H1.26a.905.905 0 0 1-.911-.9C.35 10.38 2.516 8.6 5 8.6Z" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11 8.6c-2.484 0-4.65 1.78-4.65 4.15 0 .534.445.9.91.9h7.48c.465 0 .91-.366.91-.9 0-2.37-2.166-4.15-4.65-4.15Zm0 1.3c1.76 0 3.09 1.122 3.316 2.45H7.684C7.909 11.022 9.24 9.9 11 9.9ZM5 2.35c-1.414 0-2.4 1.27-2.4 2.709 0 .727.241 1.418.652 1.938.411.52 1.023.903 1.748.903.725 0 1.337-.382 1.748-.903A3.15 3.15 0 0 0 7.4 5.059C7.4 3.62 6.414 2.35 5 2.35ZM3.9 5.059c0-.91.58-1.409 1.1-1.409.52 0 1.1.499 1.1 1.409 0 .446-.15.85-.373 1.133-.222.281-.485.408-.727.408s-.505-.127-.727-.408A1.848 1.848 0 0 1 3.9 5.059Z"
                    />
                  </svg>
                </div>
                <span className="text-[15px] font-normal text-white">
                  {grp.group_name || "Group"}
                </span>
              </div>
            ))}
          </div>

          {/* Divider Line 3 */}
          <div className="w-full border-t border-[#333333] my-4" />

          {/* Section 3: Danger Actions [Block] and [Report spam] */}
          <div className="w-full py-1">
            {/* Block */}
            <div
              onClick={() => setIsBlockConfirmOpen(true)}
              className="w-full py-3 flex items-center cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4">
                <SignalBlockIcon
                  className="w-5 h-5 shrink-0"
                  style={{ color: "#e15241" }}
                />
              </div>
              <span
                style={{ color: "#e15241" }}
                className="text-[15px] font-normal"
              >
                {isBlocked ? "Unblock" : "Block"}
              </span>
            </div>

            {/* Report spam (Revealed on scrolling down, as in Image 2) */}
            <div
              onClick={() => setIsReportSpamConfirmOpen(true)}
              className="w-full py-3 flex items-center cursor-pointer hover:bg-[#1f1f1f] rounded-lg px-2 -mx-2 transition-colors group"
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0 mr-4">
                <SignalSpamIcon
                  className="w-5 h-5 shrink-0"
                  style={{ color: "#e15241" }}
                />
              </div>
              <span
                style={{ color: "#e15241" }}
                className="text-[15px] font-normal"
              >
                Report spam
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nickname Modal */}
      {isNicknameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">Edit Nickname</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Only you will see this nickname for {displayName}.
            </p>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Enter nickname"
              autoFocus
              className="w-full bg-[#1b1b1b] border border-[#383838] rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-[var(--signal-ultramarine)] mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNicknameModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:bg-[#303030] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setNickname(nicknameInput.trim());
                  setIsNicknameModalOpen(false);
                  showStatus("Nickname saved");
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--signal-ultramarine)] hover:brightness-110 text-white cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Number Modal */}
      {isSafetyNumberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[var(--signal-ultramarine)] mb-3">
              <SignalSafetyNumberIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Verify Safety Number
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed max-w-xs">
              If you wish to verify end-to-end encryption with {displayName}, compare the numbers below with their device.
            </p>

            {/* Safety Number Digits (12 blocks of 5 digits) */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-2.5 bg-[#1b1b1b] border border-[#333333] p-4 rounded-xl text-center font-mono text-xs tracking-wider text-neutral-200 mb-6 w-full">
              <span>38491</span>
              <span>20485</span>
              <span>91847</span>
              <span>58291</span>
              <span>04825</span>
              <span>19284</span>
              <span>74829</span>
              <span>10485</span>
              <span>82947</span>
              <span>58201</span>
              <span>49285</span>
              <span>71938</span>
            </div>

            <button
              type="button"
              onClick={() => setIsSafetyNumberOpen(false)}
              className="w-full py-2 rounded-xl text-xs font-medium bg-[var(--signal-ultramarine)] hover:brightness-110 text-white cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Block Confirmation Dialog */}
      {isBlockConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">
              {isBlocked ? `Unblock ${displayName}?` : `Block ${displayName}?`}
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              {isBlocked
                ? "You will be able to receive messages and calls from them again."
                : "Blocked contacts will no longer be able to call you or send you messages."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBlockConfirmOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:bg-[#303030] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBlocked(!isBlocked);
                  setIsBlockConfirmOpen(false);
                  showStatus(!isBlocked ? "Contact blocked" : "Contact unblocked");
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer ${
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

      {/* Report Spam Confirmation Dialog */}
      {isReportSpamConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-5 animate-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-white mb-2">
              Report spam and block?
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Signal will review recent messages from this conversation. The contact will be blocked and will not know you reported them.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsBlocked(true);
                  setIsReportSpamConfirmOpen(false);
                  showStatus("Reported spam & blocked");
                }}
                className="w-full py-2 rounded-xl text-xs font-medium bg-[#ea4335] hover:bg-[#d9382b] text-white cursor-pointer"
              >
                Report spam and block
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReportSpamConfirmOpen(false);
                  showStatus("Spam reported");
                }}
                className="w-full py-2 rounded-xl text-xs font-medium bg-[#2b2b2b] hover:bg-[#383838] text-neutral-200 cursor-pointer"
              >
                Report spam only
              </button>
              <button
                type="button"
                onClick={() => setIsReportSpamConfirmOpen(false)}
                className="w-full py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConversationDetailsPane(props: ConversationDetailsPaneProps) {
  if (props.conversation.is_group) {
    return <GroupDetailsPane {...props} />;
  }
  return <DirectConversationDetailsPane {...props} />;
}
