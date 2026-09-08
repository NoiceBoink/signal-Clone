"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  X,
  UserPlus,
  Users,
  Archive,
  FolderPlus,
  Moon,
  ChevronRight,
  Check,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { api, User, MessageSearchResult } from "@/lib/api";
import { ChatListItem } from "./ChatListItem";
import { Avatar } from "./Avatar";
import { NewChatSidebarPane } from "./NewChatSidebarPane";
import { NewGroupSidebarPane } from "./NewGroupSidebarPane";
import { ArchivedChatsSidebarPane } from "./ArchivedChatsSidebarPane";
import { AddChatFolderModal } from "./modals/AddChatFolderModal";

function formatMessageSearchTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      const hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      const h12 = hours % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "Yesterday";
    }

    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function formatSenderHeader(
  msg: MessageSearchResult,
  currentUser: User | null,
  scopedContact: User | null
): string {
  if (msg.is_group) {
    const senderName =
      msg.sender_id === currentUser?.id
        ? "You"
        : msg.sender?.display_name || "Someone";
    return `${senderName} in ${msg.group_name || "Group"}`;
  }

  // 1-to-1 conversation
  if (msg.sender_id === currentUser?.id) {
    const recipientName = scopedContact?.display_name || "Contact";
    return `You to ${recipientName}`;
  } else {
    const senderName =
      msg.sender?.display_name || scopedContact?.display_name || "Contact";
    return `${senderName} to You`;
  }
}

function formatMessageContent(msg: MessageSearchResult): string {
  if (msg.message_type === "poll") {
    try {
      const poll = JSON.parse(msg.content);
      return `📊 Poll: ${poll.question}`;
    } catch {
      return "📊 Poll";
    }
  }
  if (msg.message_type === "image") {
    return "📷 Photo";
  }
  return msg.content;
}
import {
  SignalMenuIcon,
  SignalComposeIcon,
  SignalFilterIcon,
  SignalMoreIcon,
} from "./SignalIcons";

interface ChatListSidebarProps {
  isNavRailCollapsed?: boolean;
  onToggleNavRail?: () => void;
}

export function ChatListSidebar({
  isNavRailCollapsed = false,
  onToggleNavRail,
}: ChatListSidebarProps) {
  const { user } = useAuth();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    isNewChatOpen,
    setIsNewChatOpen,
    isNewGroupOpen,
    setIsNewGroupOpen,
    setIsAddContactOpen,
    setIsSettingsOpen,
    contacts,
    loadConversations,
    pinnedConversationIds,
    archivedConversationIds,
    drafts,
    draftTimestamps,
    scopedSearchContact,
    scopedSearchConversationId,
    setScopedSearch,
    setHighlightedMessageId,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isSearching = Boolean(searchQuery.trim());

  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [showNotificationProfiles, setShowNotificationProfiles] = useState(false);
  const [selectedNotificationProfile, setSelectedNotificationProfile] = useState("All");

  const [messageSearchResults, setMessageSearchResults] = useState<MessageSearchResult[]>([]);
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);

  // Auto-focus search input when scoped search opens
  useEffect(() => {
    if (scopedSearchContact || scopedSearchConversationId) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [scopedSearchContact, scopedSearchConversationId]);

  // Search messages when query changes (in scoped search mode or general mode)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setMessageSearchResults([]);
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsSearchingMessages(true);
        const results = await api.searchMessages(trimmed, {
          conversation_id: scopedSearchConversationId || undefined,
          contact_id: scopedSearchContact?.id || undefined,
        });
        if (!isCancelled) {
          setMessageSearchResults(results);
        }
      } catch (err) {
        console.error("Failed to search messages:", err);
      } finally {
        if (!isCancelled) {
          setIsSearchingMessages(false);
        }
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, scopedSearchContact, scopedSearchConversationId]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations
      .filter((c) => {
        // Exclude archived chats from the active sidebar list
        if (archivedConversationIds.includes(c.id)) {
          return false;
        }

        // Filter by unread if toggled
        if (filterUnreadOnly && (!c.unread_count || c.unread_count === 0)) {
          return false;
        }

        // When scoped to a contact
        if (scopedSearchContact) {
          const isMember = c.members?.some((m) => m.id === scopedSearchContact.id);
          if (!isMember) return false;
          if (!searchQuery.trim()) return true;
        }

        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        if (c.is_group) {
          const groupMatch = c.group_name?.toLowerCase().includes(q);
          const memberMatch = c.members?.some(
            (m) =>
              m.display_name.toLowerCase().includes(q) ||
              m.username.toLowerCase().includes(q)
          );
          return Boolean(groupMatch || memberMatch);
        } else {
          const other = c.members?.find((m) => m.id !== user?.id);
          return Boolean(
            other?.display_name.toLowerCase().includes(q) ||
            other?.username.toLowerCase().includes(q) ||
            (other?.phone && other.phone.includes(q))
          );
        }
      })
      .sort((a, b) => {
        const aPinned = pinnedConversationIds.includes(a.id);
        const bPinned = pinnedConversationIds.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        // Draft handling: Chats with active drafts take priority and go to the top
        const aHasDraft = Boolean(drafts[a.id]?.trim());
        const bHasDraft = Boolean(drafts[b.id]?.trim());
        if (aHasDraft && !bHasDraft) return -1;
        if (!aHasDraft && bHasDraft) return 1;
        if (aHasDraft && bHasDraft) {
          const aDraftTime = draftTimestamps[a.id] || 0;
          const bDraftTime = draftTimestamps[b.id] || 0;
          if (aDraftTime !== bDraftTime) {
            return bDraftTime - aDraftTime;
          }
        }

        const aTime = new Date(a.updated_at || a.last_message?.created_at || 0).getTime();
        const bTime = new Date(b.updated_at || b.last_message?.created_at || 0).getTime();
        return bTime - aTime;
      });
  }, [conversations, archivedConversationIds, pinnedConversationIds, filterUnreadOnly, searchQuery, user, drafts, draftTimestamps, scopedSearchContact]);

  // Matching contacts for search (contacts that don't already have an active conversation displayed)
  const matchingContacts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const convUserIds = new Set(
      filteredConversations
        .filter((c) => !c.is_group)
        .flatMap((c) => c.members?.map((m) => m.id) || [])
    );

    return contacts.filter((contact) => {
      if (convUserIds.has(contact.id)) return false;
      return (
        contact.display_name.toLowerCase().includes(q) ||
        contact.username.toLowerCase().includes(q) ||
        (contact.phone && contact.phone.includes(q))
      );
    });
  }, [contacts, searchQuery, filteredConversations]);

  const handleStartContactChat = async (contact: User) => {
    try {
      const conv = await api.createDirectConversation(contact.id);
      await loadConversations();
      setActiveConversationId(conv.id);
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to start chat with contact:", err);
    }
  };

  if (isNewGroupOpen) {
    return (
      <NewGroupSidebarPane
        onBack={() => {
          setIsNewGroupOpen(false);
          setIsNewChatOpen(true);
        }}
        onClose={() => setIsNewGroupOpen(false)}
      />
    );
  }

  if (isNewChatOpen) {
    return (
      <NewChatSidebarPane
        onBack={() => setIsNewChatOpen(false)}
        onOpenNewGroup={() => {
          setIsNewChatOpen(false);
          setIsNewGroupOpen(true);
        }}
      />
    );
  }

  if (isArchiveOpen) {
    return (
      <ArchivedChatsSidebarPane
        onBack={() => setIsArchiveOpen(false)}
        archivedConversations={conversations.filter((c) => archivedConversationIds.includes(c.id))}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setIsArchiveOpen(false);
        }}
      />
    );
  }

  return (
    <div className="w-[310px] md:w-[330px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] flex flex-col h-full select-none relative">
      {/* Sidebar Header (Always visible matching Signal Desktop) */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* If NavRail is collapsed, show the Hamburger button right here next to "Chats" */}
          {isNavRailCollapsed && onToggleNavRail && (
            <button
              type="button"
              onClick={onToggleNavRail}
              title="Expand navigation"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors -ml-1"
            >
              <SignalMenuIcon className="w-5 h-5" />
            </button>
          )}

          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Chats
          </h1>
        </div>

        <div className="flex items-center gap-5 pr-1">
          {/* Compose Icon Button */}
          <button
            type="button"
            onClick={() => setIsNewChatOpen(true)}
            title="New Chat"
            className="w-7 h-7 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <SignalComposeIcon className="w-5 h-5" />
          </button>

          {/* More Options Dropdown (...) */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setShowNotificationProfiles(false);
              }}
              title="More Options"
              className="w-7 h-7 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <SignalMoreIcon className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowNotificationProfiles(false);
                  }}
                />
                <div
                  style={{ width: "210px", right: "-75px" }}
                  className="absolute top-full mt-1.5 bg-[#282828] border border-[#383838]/80 rounded-2xl shadow-2xl shadow-black/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 select-none"
                >
                  {/* Option 1: View Archive */}
                  <div
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsArchiveOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[13.5px] font-normal text-white hover:bg-[#383838] transition-colors cursor-pointer"
                  >
                    <Archive className="w-4 h-4 text-[#d1d1d1] shrink-0" strokeWidth={1.8} />
                    <span style={{ whiteSpace: "nowrap" }}>View Archive</span>
                  </div>

                  {/* Option 2: Add chat folder */}
                  <div
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAddFolderOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[13.5px] font-normal text-white hover:bg-[#383838] transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4 text-[#d1d1d1] shrink-0" strokeWidth={1.8} />
                    <span style={{ whiteSpace: "nowrap" }}>Add chat folder</span>
                  </div>

                  {/* Option 3: Notification profile with hover flyout on the right */}
                  <div
                    className="relative"
                    onMouseEnter={() => setShowNotificationProfiles(true)}
                    onMouseLeave={() => setShowNotificationProfiles(false)}
                  >
                    <div
                      onClick={() => setShowNotificationProfiles(!showNotificationProfiles)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[13.5px] font-normal text-white transition-colors cursor-pointer ${
                        showNotificationProfiles ? "bg-[#383838]" : "hover:bg-[#383838]"
                      }`}
                    >
                      <Moon className="w-4 h-4 text-[#d1d1d1] shrink-0" strokeWidth={1.8} />
                      <span className="flex-1" style={{ whiteSpace: "nowrap" }}>Notification profile</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" strokeWidth={2} />
                    </div>

                    {/* Flyout Submenu to the right */}
                    {showNotificationProfiles && (
                      <div
                        style={{ left: "calc(100% + 4px)", top: "-10px", width: "195px" }}
                        className="absolute bg-[#282828] border border-[#383838]/80 rounded-2xl shadow-2xl shadow-black/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 select-none before:absolute before:-left-2 before:top-0 before:bottom-0 before:w-2"
                      >
                        <div className="px-2.5 pt-2 pb-1.5 font-bold text-[14px] text-white select-none whitespace-nowrap">
                          Notification Profile
                        </div>
                        <div
                          onClick={() => {
                            setIsMenuOpen(false);
                            setShowNotificationProfiles(false);
                            setIsSettingsOpen(true);
                          }}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[13.5px] font-normal text-white hover:bg-[#383838] transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-[#d1d1d1] shrink-0" strokeWidth={1.8} />
                          <span style={{ whiteSpace: "nowrap" }}>Settings</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar with Filter Icon matching Signal Desktop */}
      <div className="px-3 py-1.5 flex items-center gap-2">
        <div className="flex-1 relative flex items-center bg-[#282828] rounded-xl px-2.5 py-1.5 border border-transparent focus-within:border-[#383838] transition-all min-w-0">
          {scopedSearchContact ? (
            <div className="flex items-center gap-1 bg-[#3a3a3c] hover:bg-[#48484a] text-white pl-0.5 pr-1.5 py-0.5 rounded-full shrink-0 mr-2 transition-colors select-none">
              <Avatar
                name={scopedSearchContact.display_name}
                color={scopedSearchContact.avatar_color}
                initials={scopedSearchContact.initials}
                avatarUrl={scopedSearchContact.avatar_url}
                size="xs"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setScopedSearch(null, null);
                  setSearchQuery("");
                }}
                className="text-[#b0b0b5] hover:text-white transition-colors cursor-pointer p-0.5"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Search className="w-4 h-4 text-[#8e8e93] mr-2 shrink-0" />
          )}

          <input
            ref={searchInputRef}
            id="sidebar-search-input"
            data-testid="sidebar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (searchQuery) {
                  setSearchQuery("");
                } else if (scopedSearchContact) {
                  setScopedSearch(null, null);
                } else {
                  searchInputRef.current?.blur();
                }
              }
            }}
            placeholder={
              scopedSearchContact
                ? "Search chat"
                : filterUnreadOnly
                ? "Search unread chats"
                : "Search"
            }
            className="w-full bg-transparent text-[14px] text-[var(--text-primary)] placeholder-[#8e8e93] focus:outline-hidden min-w-0"
          />

          {searchQuery && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="text-[#8e8e93] hover:text-white transition-colors cursor-pointer p-0.5 rounded-full hover:bg-white/10 shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button next to Search (hidden in scoped search mode) */}
        {!scopedSearchContact && (
          <button
            type="button"
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            title={filterUnreadOnly ? "Showing unread only" : "Filter unread chats"}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              filterUnreadOnly
                ? "bg-[#4c71e7] text-white shadow-xs"
                : "text-[#8e8e93] hover:text-white hover:bg-[var(--bg-hover)]"
            }`}
          >
            <SignalFilterIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto py-1">
        {scopedSearchContact && isSearching ? (
          /* Scoped search with query -> Messages list matching reference */
          <div>
            <div className="px-4 pt-3 pb-1.5 text-[15px] font-bold text-white select-none tracking-tight">
              Messages
            </div>
            {messageSearchResults.length > 0 ? (
              messageSearchResults.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setActiveConversationId(msg.conversation_id);
                    setHighlightedMessageId(msg.id);
                  }}
                  data-testid="message-search-result"
                  className="mx-2 my-0.5 px-3 py-2.5 rounded-xl flex items-center gap-3 cursor-pointer select-none hover:bg-[var(--bg-hover)] transition-colors group"
                >
                  <Avatar
                    name={msg.sender?.display_name || scopedSearchContact.display_name}
                    color={msg.sender?.avatar_color || scopedSearchContact.avatar_color}
                    initials={msg.sender?.initials || scopedSearchContact.initials}
                    avatarUrl={msg.sender?.avatar_url || scopedSearchContact.avatar_url}
                    size="md"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="truncate text-[14.5px] font-bold text-white leading-tight">
                        {formatSenderHeader(msg, user, scopedSearchContact)}
                      </span>
                      <span className="text-[12px] text-[#8e8e93] shrink-0 font-normal ml-2">
                        {formatMessageSearchTime(msg.created_at)}
                      </span>
                    </div>
                    <div className="text-[13px] text-[#8e8e93] truncate leading-normal">
                      {formatMessageContent(msg)}
                    </div>
                  </div>
                </div>
              ))
            ) : isSearchingMessages ? (
              <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                Searching messages...
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                No results found
              </div>
            )}
          </div>
        ) : scopedSearchContact && !isSearching ? (
          /* Scoped search without query -> chats involving this contact */
          <div>
            {filteredConversations.map((conv) => (
              <ChatListItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                isPinned={pinnedConversationIds.includes(conv.id)}
                onSelect={() => setActiveConversationId(conv.id)}
              />
            ))}
          </div>
        ) : isSearching ? (
          <>
            {/* When searching with filterUnreadOnly */}
            {filterUnreadOnly ? (
              filteredConversations.length === 0 ? (
                <div style={{ paddingTop: "40px" }} className="pb-8 flex flex-col items-center justify-center px-4 select-none">
                  <div className="text-[14.5px] font-normal text-white mb-4 text-center">
                    No unread chats found
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterUnreadOnly(false);
                      setSearchQuery("");
                    }}
                    style={{ backgroundColor: "#3f3f3f" }}
                    className="px-5 py-2 rounded-full hover:brightness-125 text-[14px] font-normal text-white transition-all cursor-pointer inline-flex items-center justify-center select-none shadow-xs"
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                <div>
                  <div className="px-4 pt-3 pb-1.5 text-[15px] font-bold text-white select-none tracking-tight">
                    Filtered by unread
                  </div>
                  {filteredConversations.map((conv) => (
                    <ChatListItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === activeConversationId}
                      isPinned={pinnedConversationIds.includes(conv.id)}
                      onSelect={() => setActiveConversationId(conv.id)}
                    />
                  ))}
                </div>
              )
            ) : (
              <>
                {/* Chats Section */}
                {filteredConversations.length > 0 && (
                  <div>
                    <div className="px-4 pt-3 pb-1.5 text-[15px] font-bold text-white select-none tracking-tight">
                      Chats
                    </div>
                    {filteredConversations.map((conv) => (
                      <ChatListItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === activeConversationId}
                        isPinned={pinnedConversationIds.includes(conv.id)}
                        onSelect={() => setActiveConversationId(conv.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Contacts Section */}
                {matchingContacts.length > 0 && (
                  <div className={filteredConversations.length > 0 ? "mt-3" : ""}>
                    <div className="px-4 pt-3 pb-1.5 text-[15px] font-bold text-white select-none tracking-tight">
                      Contacts
                    </div>
                    {matchingContacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => handleStartContactChat(contact)}
                        className="mx-2 my-0.5 px-3 py-2 rounded-xl flex items-center gap-3 cursor-pointer select-none hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <Avatar
                          name={contact.display_name}
                          color={contact.avatar_color}
                          initials={contact.initials}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[14.5px] font-semibold text-[var(--text-primary)] truncate">
                            {contact.display_name}
                          </div>
                          <div className="text-[12px] text-[var(--text-muted)] truncate">
                            @{contact.username}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results state */}
                {filteredConversations.length === 0 && matchingContacts.length === 0 && (
                  <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                    No results found
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Normal non-search mode */
          <>
            {filterUnreadOnly ? (
              filteredConversations.length === 0 ? (
                <div style={{ paddingTop: "52px" }} className="pb-8 flex flex-col items-center justify-center px-4 select-none">
                  <div className="text-[14.5px] font-normal text-white mb-4 text-center">
                    No unread chats
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterUnreadOnly(false);
                      setSearchQuery("");
                    }}
                    style={{ backgroundColor: "#3f3f3f" }}
                    className="px-5 py-2 rounded-full hover:brightness-125 text-[14px] font-normal text-white transition-all cursor-pointer inline-flex items-center justify-center select-none shadow-xs"
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                <div>
                  <div className="px-4 pt-4 pb-2 text-[15px] font-bold text-white select-none">
                    Filtered by unread
                  </div>
                  {filteredConversations.map((conv) => (
                    <ChatListItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === activeConversationId}
                      isPinned={pinnedConversationIds.includes(conv.id)}
                      onSelect={() => setActiveConversationId(conv.id)}
                    />
                  ))}
                </div>
              )
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <ChatListItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  isPinned={pinnedConversationIds.includes(conv.id)}
                  onSelect={() => setActiveConversationId(conv.id)}
                />
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                No conversations yet. Start a new chat!
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Chat Folder Modal */}
      <AddChatFolderModal
        isOpen={isAddFolderOpen}
        onClose={() => setIsAddFolderOpen(false)}
        onCreateFolder={(name) => {
          setIsAddFolderOpen(false);
        }}
      />
    </div>
  );
}
