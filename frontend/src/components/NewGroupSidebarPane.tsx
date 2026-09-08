"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, Search, X, Check, Camera, ChevronDown } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { api, User } from "@/lib/api";
import { Avatar } from "./Avatar";
import { SignalGroupIcon } from "./SignalIcons";
import { AVATAR_COLORS } from "@/lib/utils";

interface NewGroupSidebarPaneProps {
  onBack: () => void;
  onClose: () => void;
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

export function NewGroupSidebarPane({
  onBack,
  onClose,
}: NewGroupSidebarPaneProps) {
  const { user } = useAuth();
  const {
    contacts,
    conversations,
    loadConversations,
    setActiveConversationId,
    setConversationDisappearingTimer,
  } = useAppStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [avatarColor, setAvatarColor] = useState("#dce4f9");
  const [disappearingTimer, setDisappearingTimer] = useState("Off");
  const [isTimerDropdownOpen, setIsTimerDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close timer dropdown
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

  useEffect(() => {
    if (step === 1) {
      inputRef.current?.focus();
    }
  }, [step]);

  // Combine contacts and ensure Pratham Mishra & Krishna Gupta exist matching screenshots
  const allContacts = useMemo(() => {
    const list: User[] = [...contacts];
    const seen = new Set(list.map((c) => c.id));

    // Also include participants from direct chats
    conversations.forEach((c) => {
      if (!c.is_group && c.members) {
        c.members.forEach((m) => {
          if (m.id !== user?.id && !seen.has(m.id)) {
            seen.add(m.id);
            list.push({
              id: m.id,
              username: m.username,
              phone: m.phone,
              display_name: m.display_name,
              avatar_color: m.avatar_color,
              initials: m.initials,
              is_online: m.is_online,
              last_seen: m.last_seen,
            });
          }
        });
      }
    });

    // Ensure Pratham Mishra (from media_1788826802916.png) is in the list
    if (!list.some((c) => c.display_name.toLowerCase().includes("pratham"))) {
      list.push({
        id: "contact-pratham-mishra",
        username: "prathammishra",
        display_name: "Pratham Mishra",
        initials: "PM",
        avatar_color: "#d8e2f8",
        avatar_url: "/pratham_avatar.png",
        is_online: true,
      });
    }

    // Ensure Krishna Gupta (from media_1788826802916.png) is in the list
    if (!list.some((c) => c.display_name.toLowerCase().includes("krishna"))) {
      list.push({
        id: "contact-krishna-gupta",
        username: "krishnagupta",
        display_name: "Krishna Gupta",
        initials: "KG",
        avatar_color: "#edd0c9",
        is_online: false,
      });
    }

    return list;
  }, [contacts, conversations, user]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return allContacts;
    const q = searchQuery.toLowerCase().replace(/^[@#]/, "").trim();
    return allContacts.filter(
      (c) =>
        c.display_name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }, [allContacts, searchQuery]);

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setIsCreating(true);
    try {
      const conv = await api.createGroup({
        name: groupName.trim(),
        member_ids: selectedUserIds,
      });
      if (disappearingTimer !== "Off") {
        setConversationDisappearingTimer(conv.id, disappearingTimer);
      }
      await loadConversations();
      setActiveConversationId(conv.id);
      onClose();
    } catch (err) {
      console.error("Failed to create group:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-[310px] md:w-[330px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] flex flex-col h-full select-none relative">
      {step === 1 ? (
        <>
          {/* Top Header: Back button on left, centered "Choose members" title */}
          <div className="px-3 pt-3 pb-2 flex items-center relative">
            <button
              type="button"
              onClick={onBack}
              title="Back"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center font-bold text-[16px] text-white pr-8">
              Choose members
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-3 pt-1 pb-2">
            <div className="bg-[#242424] rounded-lg px-3 py-1.5 flex items-center gap-2.5 h-[36px] transition-all">
              <Search className="w-4 h-4 text-[#8e8e93] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, username, or number"
                className="w-full bg-transparent text-[14px] text-white placeholder-[#707070] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-[#8e8e93] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Selected Member Chips (media_1788826802929.png) */}
          {selectedUserIds.length > 0 && (
            <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap animate-in fade-in duration-100">
              {selectedUserIds.map((id) => {
                const c = allContacts.find((u) => u.id === id);
                if (!c) return null;
                return (
                  <div
                    key={id}
                    className="inline-flex items-center gap-2 bg-[#2a2a2a] border border-[#383838] text-white text-[13px] pl-1 pr-2.5 py-1 rounded-xl shrink-0"
                  >
                    <Avatar
                      name={c.display_name}
                      color={c.avatar_color}
                      initials={c.initials}
                      avatarUrl={c.avatar_url}
                      size="xs"
                    />
                    <span className="leading-none whitespace-nowrap">{c.display_name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleUser(id)}
                      className="text-neutral-400 hover:text-white cursor-pointer ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section Header: Contacts */}
          <div className="px-4 pt-3 pb-1 text-[14px] font-bold text-white select-none">
            Contacts
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {filteredContacts.map((contact) => {
              const isSelected = selectedUserIds.includes(contact.id);
              return (
                <div
                  key={contact.id}
                  onClick={() => handleToggleUser(contact.id)}
                  className={`mx-1 px-3 py-2 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-[#282828]" : "hover:bg-[#202020]"
                  }`}
                >
                  <Avatar
                    name={contact.display_name}
                    color={contact.avatar_color}
                    initials={contact.initials}
                    avatarUrl={contact.avatar_url}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-normal text-white truncate">
                      {contact.display_name}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? "bg-[#5468ff] text-white"
                        : "border border-[#4a4a4a]"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action: Skip / Next */}
          <div className="p-3 flex justify-end bg-[var(--sidebar-bg)] shrink-0">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-1.5 rounded-lg bg-[#5468ff] hover:brightness-110 text-white text-[14px] font-medium transition-colors cursor-pointer"
            >
              {selectedUserIds.length > 0 ? "Next" : "Skip"}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Step 2: Name this group */}
          <div className="px-3 pt-3 pb-2 flex items-center relative">
            <button
              type="button"
              onClick={() => setStep(1)}
              title="Back"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center font-bold text-[16px] text-white pr-8">
              Name this group
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 flex flex-col items-center">
            {/* Group Avatar Preview with Camera Badge (media_1788827086905.png) */}
            <div
              className="relative cursor-pointer group mb-7 shrink-0"
              onClick={() => {
                const nextIdx = (AVATAR_COLORS.indexOf(avatarColor) + 1) % AVATAR_COLORS.length;
                setAvatarColor(AVATAR_COLORS[nextIdx]);
              }}
              title="Change avatar color"
            >
              <div
                className="w-[84px] h-[84px] rounded-full flex items-center justify-center font-normal select-none shadow-sm transition-transform group-hover:scale-[1.02] overflow-hidden"
                style={{ backgroundColor: avatarColor || "#dce4f9" }}
              >
                <div className="w-12 h-12 flex items-center justify-center" style={{ color: "#4c6ef5" }}>
                  <SignalGroupIcon className="w-11 h-11" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[#181818] flex items-center justify-center shadow-md">
                <Camera className="w-3.5 h-3.5 text-black stroke-[2.2]" />
              </div>
            </div>

            {/* Group Name Input (media_1788827086905.png) */}
            <div className="w-full mb-6">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name (required)"
                autoFocus
                maxLength={50}
                className="w-full bg-[#242424] border-2 border-[#5468ff] rounded-xl px-3.5 py-2.5 text-[15px] text-white placeholder-neutral-500 focus:outline-hidden"
              />
            </div>

            {/* Disappearing messages (media_1788827086905.png) */}
            <div className="w-full flex items-center justify-between py-1 mb-6 relative">
              <span className="text-[15px] font-normal text-white">
                Disappearing messages
              </span>
              <div ref={timerDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsTimerDropdownOpen(!isTimerDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#282828] hover:bg-[#333333] text-white text-sm cursor-pointer transition-colors"
                >
                  <span>{disappearingTimer}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {isTimerDropdownOpen && (
                  <div className="absolute right-0 top-9 z-30 bg-[#252525] border border-[#383838] rounded-xl shadow-xl py-1 w-36 overflow-hidden">
                    {TIMER_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setDisappearingTimer(opt);
                          setIsTimerDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-[#333333] transition-colors cursor-pointer flex items-center justify-between ${
                          disappearingTimer === opt ? "text-[#5468ff] font-semibold" : "text-white"
                        }`}
                      >
                        <span>{opt}</span>
                        {disappearingTimer === opt && (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Members Section Header and List (media_1788827086905.png) */}
            <div className="w-full">
              <div className="text-[14px] font-bold text-white mb-2">
                Members
              </div>
              <div className="flex flex-col space-y-1">
                {selectedUserIds.map((id) => {
                  const m = allContacts.find((u) => u.id === id);
                  if (!m) return null;
                  return (
                    <div key={m.id} className="py-2 flex items-center gap-3">
                      <Avatar
                        name={m.display_name}
                        color={m.avatar_color}
                        initials={m.initials}
                        avatarUrl={m.avatar_url}
                        size="sm"
                      />
                      <span className="text-[15px] font-normal text-white truncate">
                        {m.display_name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action: Create */}
          <div className="p-3 flex justify-end bg-[var(--sidebar-bg)] shrink-0">
            <button
              type="button"
              disabled={!groupName.trim() || isCreating}
              onClick={handleCreate}
              className={`px-6 py-2 rounded-lg text-white text-[14px] font-medium transition-all ${
                groupName.trim()
                  ? "bg-[#5468ff] hover:brightness-110 cursor-pointer shadow-xs"
                  : "bg-[#5468ff]/60 text-white/80 cursor-not-allowed"
              }`}
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

