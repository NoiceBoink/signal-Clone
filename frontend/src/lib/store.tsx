"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { User, Conversation, Message, api } from "./api";
import { signalWs, WebSocketEvent } from "./websocket";
import { sounds } from "./sound";
import { useAuth } from "./auth";

export type SettingsTabId =
  | "profile"
  | "general"
  | "appearance"
  | "chats"
  | "calls"
  | "notifications"
  | "privacy"
  | "data_usage"
  | "backups"
  | "donate";

interface AppStoreContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  isLoadingMessages: boolean;
  contacts: User[];
  onlineUsers: Set<string>;
  typingUsers: Record<string, { id: string; name: string }[]>; // convId -> array of typing users
  theme: "light" | "dark";
  soundEnabled: boolean;
  
  // Appearance & Settings State
  activeSettingsTab: SettingsTabId;
  userAbout: string;
  themePreference: "system" | "dark" | "light";
  chatColor: string;
  zoomLevel: string;
  language: string;
  setActiveSettingsTab: (tab: SettingsTabId) => void;
  setUserAbout: (about: string) => void;
  setThemePreference: (pref: "system" | "dark" | "light") => void;
  setChatColor: (color: string) => void;
  setZoomLevel: (zoom: string) => void;
  setLanguage: (lang: string) => void;

  // Modals
  isNewChatOpen: boolean;
  isNewGroupOpen: boolean;
  isAddContactOpen: boolean;
  isSettingsOpen: boolean;
  isGroupDetailsOpen: boolean;
  isConversationDetailsOpen: boolean;
  isCallModalOpen: boolean;
  callType: "audio" | "video";
  isAllMediaOpen: boolean;

  // Header 3-Dots State
  pinnedConversationIds: string[];
  archivedConversationIds: string[];
  mutedConversations: Record<string, string>; // convId -> duration label
  disappearingTimers: Record<string, string>; // convId -> timer label
  blockedUserIds: string[];
  isSelectingMessages: boolean;
  selectedMessageIds: string[];

  // Drafts
  drafts: Record<string, string>;
  draftTimestamps: Record<string, number>;
  setDraft: (conversationId: string, text: string) => void;

  // Scoped Search State
  scopedSearchContact: User | null;
  scopedSearchConversationId: string | null;
  setScopedSearch: (contact: User | null, conversationId?: string | null) => void;
  highlightedMessageId: string | null;
  setHighlightedMessageId: (id: string | null) => void;

  // Actions
  setActiveConversationId: (id: string | null) => void;
  loadConversations: () => Promise<void>;
  loadContacts: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, type?: string, replyTo?: any) => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  votePoll: (messageId: string, optionIndex: number) => void;
  endPoll: (messageId: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  // Header 3-Dots Actions
  togglePinConversation: (id: string) => void;
  toggleArchiveConversation: (id: string) => void;
  setConversationMuted: (id: string, duration: string | null) => void;
  setConversationDisappearingTimer: (id: string, timer: string) => void;
  toggleBlockUser: (id: string) => void;
  markConversationUnread: (id: string) => void;
  deleteConversation: (id: string) => void;
  deleteMessage: (id: string) => void;
  editMessage: (id: string, newContent: string) => void;
  togglePinMessage: (id: string) => void;
  pinnedMessageIds: string[];
  setIsSelectingMessages: (isSelecting: boolean) => void;
  toggleSelectMessage: (id: string) => void;
  clearSelectedMessages: () => void;
  deleteSelectedMessages: (conversationId: string) => void;
  setIsAllMediaOpen: (open: boolean) => void;

  // Modal Setters
  setIsNewChatOpen: (open: boolean) => void;
  setIsNewGroupOpen: (open: boolean) => void;
  setIsAddContactOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsGroupDetailsOpen: (open: boolean) => void;
  setIsConversationDetailsOpen: (open: boolean) => void;
  isKeyboardShortcutsOpen: boolean;
  setIsKeyboardShortcutsOpen: (open: boolean) => void;
  selectNextConversation: () => void;
  selectPrevConversation: () => void;
  selectConversationByIndex: (index: number) => void;
  startCall: (type: "audio" | "video") => void;
  endCall: () => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [contacts, setContacts] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, { id: string; name: string }[]>>({});
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const [soundEnabled, setSoundEnabledState] = useState(true);

  // Modals
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);
  const [isConversationDetailsOpen, setIsConversationDetailsOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [isAllMediaOpen, setIsAllMediaOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);

  // Header 3-Dots State
  const [pinnedConversationIds, setPinnedConversationIds] = useState<string[]>([]);
  const [archivedConversationIds, setArchivedConversationIds] = useState<string[]>([]);
  const [mutedConversations, setMutedConversations] = useState<Record<string, string>>({});
  const [disappearingTimers, setDisappearingTimers] = useState<Record<string, string>>({});
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [isSelectingMessages, setIsSelectingMessages] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draftTimestamps, setDraftTimestamps] = useState<Record<string, number>>({});

  // Scoped Search State
  const [scopedSearchContact, setScopedSearchContact] = useState<User | null>(null);
  const [scopedSearchConversationId, setScopedSearchConversationId] = useState<string | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  const setScopedSearch = useCallback((contact: User | null, conversationId?: string | null) => {
    setScopedSearchContact(contact);
    setScopedSearchConversationId(conversationId || null);
  }, []);

  // Settings & Appearance State
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTabId>("general");
  const [userAbout, setUserAboutState] = useState("Hey there! I am using Signal.");
  const [themePreference, setThemePreferenceState] = useState<"system" | "dark" | "light">("system");
  const [chatColor, setChatColorState] = useState("#2c6bed");
  const [zoomLevel, setZoomLevelState] = useState("100%");
  const [language, setLanguageState] = useState("System Language");

  // Load saved theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("signal_theme") as "light" | "dark" | null;
      if (savedTheme) {
        setThemeState(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      } else {
        document.documentElement.classList.add("dark");
      }

      const savedSound = localStorage.getItem("signal_sound");
      if (savedSound !== null) {
        const isEnabled = savedSound === "true";
        setSoundEnabledState(isEnabled);
        sounds.setMuted(!isEnabled);
      }

      try {
        const savedPinned = localStorage.getItem("signal_pinned_conversations");
        if (savedPinned) setPinnedConversationIds(JSON.parse(savedPinned));
        const savedArchived = localStorage.getItem("signal_archived_conversations");
        if (savedArchived) setArchivedConversationIds(JSON.parse(savedArchived));
        const savedMuted = localStorage.getItem("signal_muted_conversations");
        if (savedMuted) setMutedConversations(JSON.parse(savedMuted));
        const savedTimers = localStorage.getItem("signal_disappearing_timers");
        if (savedTimers) setDisappearingTimers(JSON.parse(savedTimers));
        const savedBlocked = localStorage.getItem("signal_blocked_users");
        if (savedBlocked) setBlockedUserIds(JSON.parse(savedBlocked));
        const savedPref = localStorage.getItem("signal_theme_preference") as "system" | "dark" | "light" | null;
        if (savedPref) setThemePreferenceState(savedPref);
        const savedColor = localStorage.getItem("signal_chat_color");
        if (savedColor) {
          setChatColorState(savedColor);
          document.documentElement.style.setProperty("--signal-ultramarine", savedColor);
          document.documentElement.style.setProperty("--bubble-outgoing", savedColor);
        }
        const savedZoom = localStorage.getItem("signal_zoom_level");
        if (savedZoom) {
          setZoomLevelState(savedZoom);
          try { (document.body.style as any).zoom = savedZoom; } catch {}
        }
        const savedLang = localStorage.getItem("signal_language");
        if (savedLang) setLanguageState(savedLang);
        const savedAbout = localStorage.getItem("signal_user_about");
        if (savedAbout) setUserAboutState(savedAbout);
        const savedDrafts = localStorage.getItem("signal_drafts");
        if (savedDrafts) setDrafts(JSON.parse(savedDrafts));
        const savedDraftTimestamps = localStorage.getItem("signal_draft_timestamps");
        if (savedDraftTimestamps) setDraftTimestamps(JSON.parse(savedDraftTimestamps));
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  }, []);

  const applyTheme = (pref: "system" | "dark" | "light") => {
    let resolved: "light" | "dark" = "dark";
    if (pref === "system") {
      if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
        resolved = "light";
      } else {
        resolved = "dark";
      }
    } else {
      resolved = pref;
    }
    setThemeState(resolved);
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", resolved === "dark");
    }
  };

  const setThemePreference = (pref: "system" | "dark" | "light") => {
    setThemePreferenceState(pref);
    if (typeof window !== "undefined") {
      localStorage.setItem("signal_theme_preference", pref);
    }
    applyTheme(pref);
  };

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    setThemePreferenceState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("signal_theme", newTheme);
      localStorage.setItem("signal_theme_preference", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  const setChatColor = (color: string) => {
    setChatColorState(color);
    if (typeof window !== "undefined") {
      localStorage.setItem("signal_chat_color", color);
      document.documentElement.style.setProperty("--signal-ultramarine", color);
      document.documentElement.style.setProperty("--bubble-outgoing", color);
    }
  };

  const setZoomLevel = (zoom: string) => {
    setZoomLevelState(zoom);
    if (typeof window !== "undefined") {
      localStorage.setItem("signal_zoom_level", zoom);
      try {
        (document.body.style as any).zoom = zoom;
      } catch {}
    }
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("signal_language", lang);
    }
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    sounds.setMuted(!enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("signal_sound", String(enabled));
    }
  };

  const setUserAbout = (about: string) => {
    setUserAboutState(about);
    if (typeof window !== "undefined") {
      localStorage.setItem("signal_user_about", about);
    }
  };

  // Load conversations & contacts on user login
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const list = await api.getConversations();
      setConversations(list);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, [user]);

  const loadContacts = useCallback(async () => {
    if (!user) return;
    try {
      const list = await api.getContacts();
      setContacts(list);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    }
  }, [user]);

  const activeConvIdRef = useRef<string | null>(activeConversationId);
  const pendingStatusMap = useRef<Map<string, string>>(new Map());

  const setActiveConversationId = useCallback((id: string | null) => {
    setActiveConversationIdState(id);
    setIsConversationDetailsOpen(false);
    setIsSelectingMessages(false);
    setSelectedMessageIds([]);
    activeConvIdRef.current = id;
    signalWs.sendActiveConversation(id);
    if (id) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c))
      );
      api.markConversationAsRead(id).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadContacts();
    } else {
      setConversations([]);
      setMessages({});
      setActiveConversationId(null);
    }
  }, [user, loadConversations, loadContacts, setActiveConversationId]);

  // Load messages when active conversation changes
  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const history = await api.getMessages(conversationId);
      setMessages((prev) => ({ ...prev, [conversationId]: history }));

      // Mark conversation as read
      await api.markConversationAsRead(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    activeConvIdRef.current = activeConversationId;
    signalWs.sendActiveConversation(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  // Connect WebSocket when user is present
  useEffect(() => {
    if (!user) {
      signalWs.disconnect();
      return;
    }

    signalWs.connect(user.id);

    const unsubscribe = signalWs.subscribe((event: WebSocketEvent) => {
      switch (event.type) {
        case "new_message": {
          const msg = event.message as Message;
          const convId = msg.conversation_id;

          // Immediately clear typing state for this message sender
          const msgSenderTimerKey = `${convId}:${msg.sender_id}`;
          const existingTypingTimer = typingTimeoutRef.current.get(msgSenderTimerKey);
          if (existingTypingTimer) {
            clearTimeout(existingTypingTimer);
            typingTimeoutRef.current.delete(msgSenderTimerKey);
          }
          setTypingUsers((prev) => {
            const current = prev[convId] || [];
            if (!current.some((t) => t.id === msg.sender_id)) return prev;
            return {
              ...prev,
              [convId]: current.filter((t) => t.id !== msg.sender_id),
            };
          });

          // Append to message timeline if loaded
          setMessages((prev) => {
            const currentList = prev[convId] || [];
            if (currentList.some((m) => m.id === msg.id)) return prev;
            return { ...prev, [convId]: [...currentList, msg] };
          });

          // Play sound
          if (msg.sender_id !== user.id) {
            sounds.playNotification();
          }

          // If active chat, mark as read immediately
          if (convId === activeConvIdRef.current && msg.sender_id !== user.id) {
            signalWs.sendRead(convId, msg.id);
            api.markMessageAsRead(convId, msg.id).catch(() => {});
          }

          // Update conversation last message and unread count
          setConversations((prev) => {
            const index = prev.findIndex((c) => c.id === convId);
            if (index === -1) {
              loadConversations();
              return prev;
            }
            const updated = [...prev];
            const conv = { ...updated[index] };
            conv.last_message = msg;
            conv.updated_at = msg.created_at;
            if (convId !== activeConvIdRef.current && msg.sender_id !== user.id) {
              conv.unread_count = (conv.unread_count || 0) + 1;
            } else {
              conv.unread_count = 0;
            }
            updated.splice(index, 1);
            return [conv, ...updated]; // Move to top
          });
          break;
        }

        case "message_sent": {
          const msg = event.message as Message;
          const convId = msg.conversation_id;
          setMessages((prev) => {
            const currentList = prev[convId] || [];
            return {
              ...prev,
              [convId]: currentList.map((m) => {
                if (m.id === msg.id) {
                  const finalStatus =
                    m.status === "read" || m.status === "delivered"
                      ? m.status
                      : (msg.status || "sent");
                  return { ...m, ...msg, status: finalStatus };
                }
                return m;
              }),
            };
          });
          break;
        }

        case "message_status": {
          const { message_id, conversation_id, status } = event;
          pendingStatusMap.current.set(message_id, status);
          setMessages((prev) => {
            const updated = { ...prev };
            const targetConvId =
              conversation_id && updated[conversation_id]
                ? conversation_id
                : Object.keys(updated).find((cId) =>
                    updated[cId].some((m) => m.id === message_id)
                  );

            if (targetConvId && updated[targetConvId]) {
              updated[targetConvId] = updated[targetConvId].map((m) =>
                m.id === message_id ? { ...m, status: status as any } : m
              );
            }
            return updated;
          });

          // Also update last_message in conversations sidebar
          setConversations((prev) =>
            prev.map((c) =>
              c.last_message && c.last_message.id === message_id
                ? { ...c, last_message: { ...c.last_message, status: status as any } }
                : c
            )
          );
          break;
        }

        case "messages_read": {
          const { conversation_id, read_by } = event as any;
          setMessages((prev) => {
            const currentList = prev[conversation_id] || [];
            return {
              ...prev,
              [conversation_id]: currentList.map((m) =>
                m.sender_id === user.id ? { ...m, status: "read" } : m
              ),
            };
          });

          // Also update last_message in sidebar
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== conversation_id) return c;
              const updatedConv = { ...c };
              if (c.last_message && c.last_message.sender_id === user.id) {
                updatedConv.last_message = { ...c.last_message, status: "read" };
              }
              if (read_by === user?.id) {
                updatedConv.unread_count = 0;
              }
              return updatedConv;
            })
          );
          break;
        }

        case "typing": {
          const { conversation_id, user_id, is_typing } = event;
          if (!user_id || (user && user_id === user.id)) break;

          if (!conversation_id) {
            // Global typing cancel for user_id across all conversations
            for (const [key, timer] of typingTimeoutRef.current.entries()) {
              if (key.endsWith(`:${user_id}`)) {
                clearTimeout(timer);
                typingTimeoutRef.current.delete(key);
              }
            }
            setTypingUsers((prev) => {
              const updated: Record<string, { id: string; name: string }[]> = {};
              let changed = false;
              for (const [cId, list] of Object.entries(prev)) {
                if (list.some((item) => item.id === user_id)) {
                  changed = true;
                  updated[cId] = list.filter((item) => item.id !== user_id);
                } else {
                  updated[cId] = list;
                }
              }
              return changed ? updated : prev;
            });
            break;
          }

          const timerKey = `${conversation_id}:${user_id}`;

          if (is_typing) {
            // Cancel existing timer if any
            const existingTimer = typingTimeoutRef.current.get(timerKey);
            if (existingTimer) {
              clearTimeout(existingTimer);
            }

            // Find user's display name
            let name = "Someone";
            for (const c of conversations) {
              const member = c.members?.find((m) => m.id === user_id);
              if (member) {
                name = member.display_name;
                break;
              }
            }
            if (name === "Someone") {
              const contact = contacts.find((ct) => ct.id === user_id);
              if (contact) name = contact.display_name;
            }

            setTypingUsers((prev) => {
              const current = prev[conversation_id] || [];
              if (current.some((item) => item.id === user_id)) {
                return prev;
              }
              return {
                ...prev,
                [conversation_id]: [...current, { id: user_id, name }],
              };
            });

            // Set 2500ms safety auto-expire timeout: ceases typing automatically after ~2.5s if no renewed typing event arrives
            const timer = setTimeout(() => {
              setTypingUsers((prev) => {
                const current = prev[conversation_id] || [];
                return {
                  ...prev,
                  [conversation_id]: current.filter((item) => item.id !== user_id),
                };
              });
              typingTimeoutRef.current.delete(timerKey);
            }, 2500);

            typingTimeoutRef.current.set(timerKey, timer);
          } else {
            // is_typing: false
            const existingTimer = typingTimeoutRef.current.get(timerKey);
            if (existingTimer) {
              clearTimeout(existingTimer);
              typingTimeoutRef.current.delete(timerKey);
            }

            setTypingUsers((prev) => {
              const current = prev[conversation_id] || [];
              if (!current.some((item) => item.id === user_id)) return prev;
              return {
                ...prev,
                [conversation_id]: current.filter((item) => item.id !== user_id),
              };
            });
          }
          break;
        }

        case "user_status": {
          const { user_id, is_online } = event;
          setOnlineUsers((prev) => {
            const updated = new Set(prev);
            if (is_online) updated.add(user_id);
            else updated.delete(user_id);
            return updated;
          });

          if (!is_online) {
            // Purge all typing indicators for this user upon disconnect
            for (const [key, timer] of typingTimeoutRef.current.entries()) {
              if (key.endsWith(`:${user_id}`)) {
                clearTimeout(timer);
                typingTimeoutRef.current.delete(key);
              }
            }
            setTypingUsers((prev) => {
              const updated: Record<string, { id: string; name: string }[]> = {};
              let changed = false;
              for (const [cId, list] of Object.entries(prev)) {
                if (list.some((item) => item.id === user_id)) {
                  changed = true;
                  updated[cId] = list.filter((item) => item.id !== user_id);
                } else {
                  updated[cId] = list;
                }
              }
              return changed ? updated : prev;
            });
          }

          if (is_online) {
            // Instantly transition any pending 'sent' messages to this peer to 'delivered'
            setMessages((prev) => {
              const updated = { ...prev };
              let hasChanges = false;
              for (const cId of Object.keys(updated)) {
                updated[cId] = updated[cId].map((m) => {
                  if (m.sender_id === user?.id && m.status === "sent") {
                    hasChanges = true;
                    return { ...m, status: "delivered" };
                  }
                  return m;
                });
              }
              return hasChanges ? updated : prev;
            });

            setConversations((prev) =>
              prev.map((c) =>
                c.last_message &&
                c.last_message.sender_id === user?.id &&
                c.last_message.status === "sent"
                  ? { ...c, last_message: { ...c.last_message, status: "delivered" } }
                  : c
              )
            );
          }
          break;
        }

        case "new_conversation":
        case "conversation_updated": {
          loadConversations();
          break;
        }
      }
    });

    return () => {
      unsubscribe();
      signalWs.disconnect();
      for (const timer of typingTimeoutRef.current.values()) {
        clearTimeout(timer);
      }
      typingTimeoutRef.current.clear();
    };
  }, [user, loadConversations]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const sendMessage = async (content: string, type = "text", replyTo?: any) => {
    if (!activeConversationId || !user) return;

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: activeConversationId,
      sender_id: user.id,
      content,
      message_type: type,
      status: "sending",
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_color: user.avatar_color,
        initials: user.initials,
      },
      reply_to: replyTo,
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), optimisticMsg],
    }));

    sounds.playSent();

    try {
      const savedMsg = await api.sendMessage(activeConversationId, content, type);
      const bufferedStatus = pendingStatusMap.current.get(savedMsg.id);
      if (bufferedStatus) {
        savedMsg.status = bufferedStatus as any;
        pendingStatusMap.current.delete(savedMsg.id);
      }

      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
          m.id === tempId ? { ...savedMsg, reply_to: replyTo } : m
        ),
      }));

      // Update conversation in sidebar
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === activeConversationId);
        if (index === -1) return prev;
        const updated = [...prev];
        const conv = { ...updated[index], last_message: savedMsg, updated_at: savedMsg.created_at };
        updated.splice(index, 1);
        return [conv, ...updated];
      });

      // Clear draft on successful send
      setDrafts((prev) => {
        if (!prev[activeConversationId]) return prev;
        const next = { ...prev };
        delete next[activeConversationId];
        try {
          localStorage.setItem("signal_drafts", JSON.stringify(next));
        } catch {}
        return next;
      });
      setDraftTimestamps((prev) => {
        if (!prev[activeConversationId]) return prev;
        const next = { ...prev };
        delete next[activeConversationId];
        try {
          localStorage.setItem("signal_draft_timestamps", JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      // Revert or mark failed
      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).filter((m) => m.id !== tempId),
      }));
    }
  };

  const sendTyping = (isTyping: boolean) => {
    if (activeConversationId) {
      signalWs.sendTyping(activeConversationId, isTyping);
    }
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    if (!activeConversationId || !user) return;
    setMessages((prev) => {
      const list = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: list.map((m) => {
          if (m.id !== messageId) return m;

          const currentReactions: Record<string, string[]> = {};
          let hadSameEmoji = false;

          // Restrict so each user can have at most ONE reacted emoji per message:
          // Remove this user from all existing reactions first
          for (const [existingEmoji, uids] of Object.entries(m.reactions || {})) {
            const hasThisUser = uids.includes(user.id);
            if (existingEmoji === emoji && hasThisUser) {
              hadSameEmoji = true;
            }
            const filtered = uids.filter((uid) => uid !== user.id);
            if (filtered.length > 0) {
              currentReactions[existingEmoji] = filtered;
            }
          }

          // If user didn't already have this exact emoji, add it
          // If they did, hadSameEmoji is true, so it toggles off completely
          if (!hadSameEmoji) {
            currentReactions[emoji] = [...(currentReactions[emoji] || []), user.id];
          }

          return { ...m, reactions: currentReactions };
        }),
      };
    });
  };

  const votePoll = (messageId: string, optionIndex: number) => {
    if (!activeConversationId || !user) return;
    setMessages((prev) => {
      const list = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: list.map((m) => {
          if (m.id !== messageId || m.message_type !== "poll") return m;

          try {
            const poll = JSON.parse(m.content);
            if (poll.ended) return m;
            const votes: Record<string, string[]> = { ...(poll.votes || {}) };
            const key = String(optionIndex);

            if (poll.allow_multiple) {
              const currentList = votes[key] || [];
              if (currentList.includes(user.id)) {
                votes[key] = currentList.filter((id) => id !== user.id);
              } else {
                votes[key] = [...currentList, user.id];
              }
            } else {
              const wasSelected = (votes[key] || []).includes(user.id);
              for (const k of Object.keys(votes)) {
                votes[k] = (votes[k] || []).filter((id) => id !== user.id);
              }
              if (!wasSelected) {
                votes[key] = [...(votes[key] || []), user.id];
              }
            }

            poll.votes = votes;
            return {
              ...m,
              content: JSON.stringify(poll),
            };
          } catch {
            return m;
          }
        }),
      };
    });
  };

  const endPoll = (messageId: string) => {
    if (!activeConversationId) return;
    setMessages((prev) => {
      const list = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: list.map((m) => {
          if (m.id !== messageId || m.message_type !== "poll") return m;

          try {
            const poll = JSON.parse(m.content);
            poll.ended = true;
            return {
              ...m,
              content: JSON.stringify(poll),
            };
          } catch {
            return m;
          }
        }),
      };
    });
  };

  // Header 3-Dots Actions
  const togglePinConversation = useCallback((id: string) => {
    setPinnedConversationIds((prev) => {
      const next = prev.includes(id) ? prev.filter((cId) => cId !== id) : [id, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("signal_pinned_conversations", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const toggleArchiveConversation = useCallback((id: string) => {
    setArchivedConversationIds((prev) => {
      const next = prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id];
      if (typeof window !== "undefined") {
        localStorage.setItem("signal_archived_conversations", JSON.stringify(next));
      }
      return next;
    });
    // If current chat is archived, close it
    setActiveConversationIdState((curr) => (curr === id ? null : curr));
  }, []);

  const selectNextConversation = useCallback(() => {
    setConversations((convs) => {
      const activeConvs = convs.filter((c) => !archivedConversationIds.includes(c.id));
      if (activeConvs.length === 0) return convs;
      setActiveConversationIdState((currentId) => {
        const currentIndex = activeConvs.findIndex((c) => c.id === currentId);
        const nextIndex = currentIndex < activeConvs.length - 1 ? currentIndex + 1 : 0;
        return activeConvs[nextIndex].id;
      });
      return convs;
    });
  }, [archivedConversationIds]);

  const selectPrevConversation = useCallback(() => {
    setConversations((convs) => {
      const activeConvs = convs.filter((c) => !archivedConversationIds.includes(c.id));
      if (activeConvs.length === 0) return convs;
      setActiveConversationIdState((currentId) => {
        const currentIndex = activeConvs.findIndex((c) => c.id === currentId);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : activeConvs.length - 1;
        return activeConvs[prevIndex].id;
      });
      return convs;
    });
  }, [archivedConversationIds]);

  const selectConversationByIndex = useCallback((index: number) => {
    setConversations((convs) => {
      const activeConvs = convs.filter((c) => !archivedConversationIds.includes(c.id));
      if (index >= 0 && index < activeConvs.length) {
        setActiveConversationIdState(activeConvs[index].id);
      }
      return convs;
    });
  }, [archivedConversationIds]);

  const setConversationMuted = useCallback((id: string, duration: string | null) => {
    setMutedConversations((prev) => {
      const next = { ...prev };
      if (!duration) {
        delete next[id];
      } else {
        next[id] = duration;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("signal_muted_conversations", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const setConversationDisappearingTimer = useCallback((id: string, timer: string) => {
    setDisappearingTimers((prev) => {
      const next = { ...prev, [id]: timer };
      if (typeof window !== "undefined") {
        localStorage.setItem("signal_disappearing_timers", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const toggleBlockUser = useCallback((id: string) => {
    setBlockedUserIds((prev) => {
      const next = prev.includes(id) ? prev.filter((uId) => uId !== id) : [...prev, id];
      if (typeof window !== "undefined") {
        localStorage.setItem("signal_blocked_users", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const markConversationUnread = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread_count: Math.max(c.unread_count || 0, 1) } : c))
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setPinnedConversationIds((prev) => {
      const next = prev.filter((cId) => cId !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("signal_pinned_conversations", JSON.stringify(next));
      }
      return next;
    });
    setArchivedConversationIds((prev) => {
      const next = prev.filter((cId) => cId !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("signal_archived_conversations", JSON.stringify(next));
      }
      return next;
    });
    setDrafts((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      try {
        localStorage.setItem("signal_drafts", JSON.stringify(next));
      } catch {}
      return next;
    });
    setDraftTimestamps((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      try {
        localStorage.setItem("signal_draft_timestamps", JSON.stringify(next));
      } catch {}
      return next;
    });
    setActiveConversationIdState((curr) => (curr === id ? null : curr));
  }, []);

  const setDraft = useCallback((conversationId: string, text: string) => {
    const trimmed = text.trim();
    setDrafts((prev) => {
      const next = { ...prev };
      if (trimmed) {
        next[conversationId] = text;
      } else {
        delete next[conversationId];
      }
      try {
        localStorage.setItem("signal_drafts", JSON.stringify(next));
      } catch {}
      return next;
    });

    setDraftTimestamps((prev) => {
      const next = { ...prev };
      if (trimmed) {
        next[conversationId] = Date.now();
      } else {
        delete next[conversationId];
      }
      try {
        localStorage.setItem("signal_draft_timestamps", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleSelectMessage = useCallback((messageId: string) => {
    setSelectedMessageIds((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId]
    );
  }, []);

  const clearSelectedMessages = useCallback(() => {
    setSelectedMessageIds([]);
    setIsSelectingMessages(false);
  }, []);

  const deleteSelectedMessages = useCallback((conversationId: string) => {
    setMessages((prev) => {
      const list = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: list.filter((m) => !selectedMessageIds.includes(m.id)),
      };
    });
    setSelectedMessageIds([]);
    setIsSelectingMessages(false);
  }, [selectedMessageIds]);

  const deleteMessage = useCallback((messageId: string) => {
    if (!activeConversationId) return;
    setMessages((prev) => {
      const list = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: list.filter((m) => m.id !== messageId),
      };
    });
  }, [activeConversationId]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (!activeConversationId) return;
    setMessages((prev) => {
      const list = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: list.map((m) =>
          m.id === messageId ? { ...m, content: newContent, is_edited: true } : m
        ),
      };
    });
  }, [activeConversationId]);

  const togglePinMessage = useCallback((messageId: string) => {
    setPinnedMessageIds((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId]
    );
  }, []);

  const startCall = (type: "audio" | "video") => {
    setCallType(type);
    setIsCallModalOpen(true);
  };

  const endCall = () => {
    setIsCallModalOpen(false);
  };

  return (
    <AppStoreContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeConversation,
        messages,
        isLoadingMessages,
        contacts,
        onlineUsers,
        typingUsers,
        theme,
        soundEnabled,

        activeSettingsTab,
        userAbout,
        themePreference,
        chatColor,
        zoomLevel,
        language,
        setActiveSettingsTab,
        setUserAbout,
        setThemePreference,
        setChatColor,
        setZoomLevel,
        setLanguage,

        isNewChatOpen,
        isNewGroupOpen,
        isAddContactOpen,
        isSettingsOpen,
        isGroupDetailsOpen,
        isConversationDetailsOpen,
        isCallModalOpen,
        callType,
        isAllMediaOpen,

        pinnedConversationIds,
        archivedConversationIds,
        mutedConversations,
        disappearingTimers,
        blockedUserIds,
        isSelectingMessages,
        selectedMessageIds,

        drafts,
        draftTimestamps,
        setDraft,

        scopedSearchContact,
        scopedSearchConversationId,
        setScopedSearch,
        highlightedMessageId,
        setHighlightedMessageId,

        setActiveConversationId,
        loadConversations,
        loadContacts,
        loadMessages,
        sendMessage,
        sendTyping,
        toggleReaction,
        votePoll,
        endPoll,
        setTheme,
        setSoundEnabled,

        togglePinConversation,
        toggleArchiveConversation,
        setConversationMuted,
        setConversationDisappearingTimer,
        toggleBlockUser,
        markConversationUnread,
        deleteConversation,
        deleteMessage,
        editMessage,
        togglePinMessage,
        pinnedMessageIds,
        setIsSelectingMessages,
        toggleSelectMessage,
        clearSelectedMessages,
        deleteSelectedMessages,
        setIsAllMediaOpen,

        setIsNewChatOpen,
        setIsNewGroupOpen,
        setIsAddContactOpen,
        setIsSettingsOpen,
        setIsGroupDetailsOpen,
        setIsConversationDetailsOpen,
        isKeyboardShortcutsOpen,
        setIsKeyboardShortcutsOpen,
        selectNextConversation,
        selectPrevConversation,
        selectConversationByIndex,
        startCall,
        endCall,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppStoreProvider");
  }
  return context;
}

