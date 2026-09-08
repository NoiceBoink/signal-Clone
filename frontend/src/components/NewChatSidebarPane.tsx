"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, Search, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { api, User } from "@/lib/api";
import { Avatar } from "./Avatar";
import {
  SignalGroupIcon,
  SignalNoteIcon,
  SignalOfficialBadgeIcon,
} from "./SignalIcons";

interface NewChatSidebarPaneProps {
  onBack: () => void;
  onOpenNewGroup: () => void;
}

export function NewChatSidebarPane({
  onBack,
  onOpenNewGroup,
}: NewChatSidebarPaneProps) {
  const { user } = useAuth();
  const {
    contacts,
    conversations,
    loadContacts,
    loadConversations,
    setActiveConversationId,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input and load contacts on mount
  useEffect(() => {
    inputRef.current?.focus();
    loadContacts();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loadContacts, onBack]);

  // Debounced search for non-contact users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const cleanQuery = searchQuery.replace(/^[@#]/, "").trim();
        if (cleanQuery) {
          const results = await api.searchUsers(cleanQuery);
          setSearchResults(results.filter((u) => u.id !== user?.id));
        }
      } catch (err) {
        console.error("Search users error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const handleStartChat = async (targetUserId: string) => {
    try {
      const conv = await api.createDirectConversation(targetUserId);
      await loadConversations();
      setActiveConversationId(conv.id);
      onBack();
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  const handleOpenNoteToSelf = async () => {
    if (!user) return;
    await handleStartChat(user.id);
  };

  // Combine contacts with any direct conversation participants so all contacts appear
  const allContacts = useMemo(() => {
    const list: User[] = [...contacts];
    const seen = new Set(list.map((c) => c.id));

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

    return list;
  }, [contacts, conversations, user]);

  // Filter existing contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return allContacts;
    const q = searchQuery.toLowerCase().replace(/^[@#]/, "").trim();
    return allContacts.filter((c) => {
      return (
        c.display_name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
      );
    });
  }, [allContacts, searchQuery]);

  const isQueryEmpty = !searchQuery.trim();

  return (
    <div className="w-[310px] md:w-[330px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] flex flex-col h-full select-none relative">
      {/* Header: Back Chevron & Centered 'New chat' Title */}
      <div className="px-3 pt-3 pb-2 flex items-center relative">
        <button
          type="button"
          onClick={onBack}
          title="Back"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center font-bold text-[16px] text-white pr-8">
          New chat
        </div>
      </div>

      {/* Search Bar (Clean without blue ring) */}
      <div className="px-3 pt-1 pb-2">
        <div className="bg-[#2c2c2c] rounded-lg px-3 py-1.5 flex items-center gap-2.5 h-[36px] transition-all">
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
        {/* Quick Action Buttons (shown when not searching) */}
        {isQueryEmpty && (
          <div className="flex flex-col gap-0.5 pt-0.5 pb-1">
            {/* Action 1: New group */}
            <div
              onClick={onOpenNewGroup}
              className="mx-2 px-3 py-2 rounded-xl flex items-center gap-3.5 hover:bg-[#282828] cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#2c2c2c] flex items-center justify-center text-[#d1d1d1] shrink-0">
                <SignalGroupIcon className="w-[22px] h-[22px]" />
              </div>
              <span className="text-[15px] font-normal text-white">New group</span>
            </div>

            {/* Action 2: Find by username */}
            <div
              onClick={() => {
                setSearchQuery("@");
                inputRef.current?.focus();
              }}
              className="mx-2 px-3 py-2 rounded-xl flex items-center gap-3.5 hover:bg-[#282828] cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#2c2c2c] flex items-center justify-center text-[#d1d1d1] shrink-0">
                <span className="text-[22px] font-normal leading-none select-none">@</span>
              </div>
              <span className="text-[15px] font-normal text-white">Find by username</span>
            </div>

            {/* Action 3: Find by phone number */}
            <div
              onClick={() => {
                setSearchQuery("+");
                inputRef.current?.focus();
              }}
              className="mx-2 px-3 py-2 rounded-xl flex items-center gap-3.5 hover:bg-[#282828] cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#2c2c2c] flex items-center justify-center text-[#d1d1d1] shrink-0">
                <span className="text-[22px] font-normal leading-none select-none">#</span>
              </div>
              <span className="text-[15px] font-normal text-white">Find by phone number</span>
            </div>
          </div>
        )}

        {/* Section Header: Contacts */}
        <div className="px-4 pt-3 pb-1 text-[14px] font-bold text-white select-none">
          Contacts
        </div>

        {/* Contacts List */}
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => handleStartChat(contact.id)}
            className="mx-2 px-3 py-1.5 rounded-xl flex items-center gap-3 hover:bg-[#282828] cursor-pointer transition-colors"
          >
            <Avatar
              name={contact.display_name}
              color={contact.avatar_color}
              initials={contact.initials}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-normal text-white truncate">
                {contact.display_name}
              </div>
            </div>
          </div>
        ))}

        {/* Note to Self (present in Contacts list when empty search or matches 'note') */}
        {(isQueryEmpty || "note to self".includes(searchQuery.toLowerCase())) && (
          <div
            onClick={handleOpenNoteToSelf}
            className="mx-2 px-3 py-1.5 rounded-xl flex items-center gap-3 hover:bg-[#282828] cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#fae5e5] flex items-center justify-center shrink-0">
              <SignalNoteIcon className="w-4 h-4 text-[#b83a3a]" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-[15px] font-normal text-white truncate">
                Note to Self
              </span>
              <SignalOfficialBadgeIcon className="w-4 h-4 text-[#4c71e7] shrink-0" />
            </div>
          </div>
        )}

        {/* Search Results from server (if searching and not already in contacts) */}
        {!isQueryEmpty && searchResults.length > 0 && (
          <>
            <div className="px-4 pt-4 pb-1 text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-wider select-none">
              Other Users
            </div>
            {searchResults
              .filter((u) => !allContacts.some((c) => c.id === u.id))
              .map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleStartChat(u.id)}
                  className="mx-2 px-3 py-1.5 rounded-xl flex items-center gap-3 hover:bg-[#282828] cursor-pointer transition-colors"
                >
                  <Avatar
                    name={u.display_name}
                    color={u.avatar_color}
                    initials={u.initials}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-normal text-white truncate">
                      {u.display_name}
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}

        {/* Empty state when searching and nothing found */}
        {!isQueryEmpty &&
          filteredContacts.length === 0 &&
          searchResults.length === 0 &&
          !isSearching && (
            <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
              No contacts or users found
            </div>
          )}

        {isSearching && (
          <div className="px-4 py-4 text-center text-xs text-[var(--text-muted)] animate-pulse">
            Searching...
          </div>
        )}
      </div>
    </div>
  );
}
