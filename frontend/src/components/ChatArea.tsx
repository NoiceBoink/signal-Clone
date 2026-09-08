"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Lock, ArrowDown, Shield } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Message } from "@/lib/api";
import { formatDateSeparator } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput } from "./MessageInput";
import { Avatar } from "./Avatar";
import { ConversationHero } from "./ConversationHero";
import { ConversationDetailsPane } from "./ConversationDetailsPane";
import { AllMediaModal } from "./modals/AllMediaModal";
import { MessageInfoView } from "./MessageInfoView";

interface ChatAreaProps {
  onBack?: () => void;
}

export function ChatArea({ onBack }: ChatAreaProps) {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    isLoadingMessages,
    typingUsers,
    sendMessage,
    sendTyping,
    toggleReaction,
    isGroupDetailsOpen,
    setIsGroupDetailsOpen,
    isConversationDetailsOpen,
    setIsConversationDetailsOpen,
    isSelectingMessages,
    selectedMessageIds,
    toggleSelectMessage,
    clearSelectedMessages,
    deleteSelectedMessages,
    highlightedMessageId,
    setHighlightedMessageId,
    scopedSearchContact,
    setScopedSearch,
  } = useAppStore();

  const otherUser = useMemo(() => {
    if (!activeConversation || activeConversation.is_group) return null;
    return activeConversation.members?.find((m) => m.id !== user?.id) || null;
  }, [activeConversation, user]);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [inspectingMessage, setInspectingMessage] = useState<Message | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Clear message info when conversation changes
  useEffect(() => {
    setInspectingMessage(null);
  }, [activeConversation?.id]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages[activeConversation.id] || [];
  }, [activeConversation, messages]);

  const typers = useMemo(() => {
    if (!activeConversation) return [];
    const list = typingUsers[activeConversation.id] || [];
    return list.filter((t) => t.id !== user?.id);
  }, [activeConversation, typingUsers, user]);

  // Scroll to bottom on new messages or typing (unless scrolling to a highlighted message)
  useEffect(() => {
    if (!highlightedMessageId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, typers, highlightedMessageId]);

  // Scroll to highlighted message when clicked from search
  useEffect(() => {
    if (highlightedMessageId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`msg-${highlightedMessageId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
      const clearTimer = setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2500);
      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [highlightedMessageId, setHighlightedMessageId]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Chat Area Keyboard Shortcuts: Scoped Search (Ctrl+Shift+F), Reply (Ctrl+Shift+R), Scroll Top (Ctrl+Home), Scroll Bottom (Ctrl+End)
  useEffect(() => {
    const handleChatShortcuts = (e: KeyboardEvent) => {
      if (!activeConversation) return;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const key = e.key.toLowerCase();

      // Scoped search in chat: Ctrl + Shift + F
      if (isCtrlOrCmd && isShift && key === "f") {
        e.preventDefault();
        if (scopedSearchContact?.id === otherUser?.id) {
          setScopedSearch(null, null);
        } else if (otherUser) {
          setScopedSearch(otherUser, activeConversation.id);
        } else {
          setScopedSearch(null, activeConversation.id);
        }
        return;
      }

      // Reply to latest message: Ctrl + Shift + R
      if (isCtrlOrCmd && isShift && key === "r") {
        e.preventDefault();
        if (currentMessages.length > 0) {
          const lastMsg = currentMessages[currentMessages.length - 1];
          if (lastMsg.message_type !== "system") {
            setReplyingTo(lastMsg);
          }
        }
        return;
      }

      // Scroll to top: Ctrl + Home
      if (isCtrlOrCmd && e.key === "Home") {
        e.preventDefault();
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      // Scroll to bottom: Ctrl + End
      if (isCtrlOrCmd && e.key === "End") {
        e.preventDefault();
        scrollToBottom();
        return;
      }
    };

    window.addEventListener("keydown", handleChatShortcuts);
    return () => window.removeEventListener("keydown", handleChatShortcuts);
  }, [
    activeConversation,
    otherUser,
    scopedSearchContact,
    setScopedSearch,
    currentMessages,
  ]);

  // If no active conversation, show Signal Desktop Empty State
  if (!activeConversation) {
    return (
      <div className="flex-1 bg-[var(--bg-primary)] flex flex-col items-center justify-center p-8 select-none text-center">
        <div className="w-24 h-24 mb-6 relative opacity-90 transition-transform hover:scale-105">
          <Image
            src="/signal-logo.svg"
            alt="Signal Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Signal for Desktop
        </h2>

        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">
          Select a chat or start a new conversation to begin secure, end-to-end encrypted messaging.
        </p>

        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-4 py-2 rounded-full border border-[var(--border-primary)] shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-[var(--signal-ultramarine)]" />
          <span>Encrypted with simulated Signal Protocol</span>
        </div>
      </div>
    );
  }

  // If inspecting message info, show full MessageInfoView
  if (inspectingMessage) {
    return (
      <MessageInfoView
        message={inspectingMessage}
        conversation={activeConversation}
        onClose={() => setInspectingMessage(null)}
      />
    );
  }

  return (
    <div className="flex-1 bg-[var(--bg-primary)] flex flex-col h-full overflow-hidden relative">
      {/* Conversation Top Header */}
      <ChatHeader conversation={activeConversation} onBack={onBack} />

      {/* Message Timeline */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 py-4 relative"
      >
        {/* Authentic Signal Contact Hero Card */}
        <ConversationHero
          conversation={activeConversation}
          otherUser={otherUser}
          onOpenDetails={() => {
            setIsConversationDetailsOpen(true);
          }}
        />

        {/* Message List grouped with Date Dividers and 3-Minute Clusters */}
        {isLoadingMessages && currentMessages.length === 0 ? (
          <div className="flex justify-center my-8 text-xs text-[var(--text-muted)]">
            Loading messages...
          </div>
        ) : (
          currentMessages.map((msg, index) => {
            const prevMsg = currentMessages[index - 1];
            const nextMsg = currentMessages[index + 1];

            const showDate =
              !prevMsg ||
              formatDateSeparator(msg.created_at) !==
                formatDateSeparator(prevMsg.created_at);

            const CLUSTER_WINDOW_MS = 3 * 60 * 1000; // 3 minutes
            const prevTime = prevMsg ? new Date(prevMsg.created_at).getTime() : 0;
            const currTime = new Date(msg.created_at).getTime();
            const nextTime = nextMsg ? new Date(nextMsg.created_at).getTime() : 0;

            // Is this message the start of a cluster?
            const isStartOfCluster =
              !prevMsg ||
              showDate ||
              prevMsg.sender_id !== msg.sender_id ||
              prevMsg.message_type === "system" ||
              msg.message_type === "system" ||
              currTime - prevTime > CLUSTER_WINDOW_MS;

            // Is this message the end of a cluster?
            const isEndOfCluster =
              !nextMsg ||
              nextMsg.sender_id !== msg.sender_id ||
              nextMsg.message_type === "system" ||
              msg.message_type === "system" ||
              formatDateSeparator(nextMsg.created_at) !==
                formatDateSeparator(msg.created_at) ||
              nextTime - currTime > CLUSTER_WINDOW_MS;

            const isSingle = isStartOfCluster && isEndOfCluster;
            const isFirst = isStartOfCluster && !isEndOfCluster;
            const isLast = isEndOfCluster && !isStartOfCluster;

            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="flex justify-center py-3 select-none">
                    <span className="text-xs font-normal text-[var(--text-muted)]">
                      {formatDateSeparator(msg.created_at)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isGroup={activeConversation.is_group}
                  isFirstInCluster={isFirst}
                  isLastInCluster={isLast}
                  isSingleInCluster={isSingle}
                  isStartOfNewCluster={isStartOfCluster && !showDate && index > 0}
                  isSelecting={isSelectingMessages}
                  isSelected={selectedMessageIds.includes(msg.id)}
                  onToggleSelect={() => toggleSelectMessage(msg.id)}
                  onReply={(target) => setReplyingTo(target)}
                  onReaction={(id, emoji) => toggleReaction(id, emoji)}
                  onOpenInfo={(target) => setInspectingMessage(target)}
                />
              </React.Fragment>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {typers.length > 0 && !isSelectingMessages && (
          <TypingIndicator
            senderName={
              activeConversation.is_group
                ? typers.map((t) => t.name).join(", ")
                : undefined
            }
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && !isSelectingMessages && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 w-9 h-9 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-md text-[var(--text-primary)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-transform hover:scale-105 z-20"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Message Selection Action Bar OR Message Input Area */}
      {isSelectingMessages ? (
        <div className="h-[56px] px-6 bg-[#202020] border-t border-[var(--border-primary)] flex items-center justify-between select-none z-20 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 text-white text-sm font-semibold">
            <span>
              {selectedMessageIds.length}{" "}
              {selectedMessageIds.length === 1 ? "message" : "messages"} selected
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={clearSelectedMessages}
              className="px-4 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-[#333333] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedMessageIds.length === 0}
              onClick={() => {
                const selectedTexts = currentMessages
                  .filter((m) => selectedMessageIds.includes(m.id))
                  .map((m) => m.content)
                  .join("\n");
                navigator.clipboard.writeText(selectedTexts);
                clearSelectedMessages();
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-medium text-neutral-200 bg-[#2f2f2f] hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Copy
            </button>
            <button
              type="button"
              disabled={selectedMessageIds.length === 0}
              onClick={() => deleteSelectedMessages(activeConversation.id)}
              className="px-4 py-1.5 rounded-xl text-xs font-medium bg-[#ea4335] hover:bg-[#d9382b] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <MessageInput
          onSendMessage={(content, type, replyTo) =>
            sendMessage(content, type, replyTo)
          }
          onTyping={(isTyping) => sendTyping(isTyping)}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      )}

      {/* Conversation Details Panel (When avatar/name is clicked) */}
      {(isConversationDetailsOpen || isGroupDetailsOpen) && (
        <ConversationDetailsPane
          conversation={activeConversation}
          onClose={() => {
            setIsConversationDetailsOpen(false);
            setIsGroupDetailsOpen(false);
          }}
        />
      )}

      {/* All Media Viewer Modal */}
      <AllMediaModal />
    </div>
  );
}

