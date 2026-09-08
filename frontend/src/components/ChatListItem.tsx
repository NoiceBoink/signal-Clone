"use client";

import React from "react";
import { Conversation } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatConversationTimestamp } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { ReceiptIcon } from "./ReceiptIcon";
import { SignalPinChatIcon } from "./SignalIcons";

interface ChatListItemProps {
  conversation: Conversation;
  isActive: boolean;
  isPinned?: boolean;
  onSelect: () => void;
}

export function ChatListItem({ conversation, isActive, isPinned = false, onSelect }: ChatListItemProps) {
  const { user } = useAuth();
  const { typingUsers, drafts } = useAppStore();

  const isGroup = conversation.is_group;
  const displayName = isGroup
    ? conversation.group_name || "Group Chat"
    : conversation.members?.find((m) => m.id !== user?.id)?.display_name || "Unknown User";

  const otherUser = !isGroup
    ? conversation.members?.find((m) => m.id !== user?.id)
    : null;

  const avatarColor = isGroup
    ? conversation.group_avatar_color
    : otherUser?.avatar_color;

  const lastMsg = conversation.last_message;
  const isOutgoing = lastMsg && user && lastMsg.sender_id === user.id;

  const typers = (typingUsers[conversation.id] || []).filter(
    (t) => t.id !== user?.id
  );
  const isTyping = typers.length > 0;

  // Draft state
  const draftText = drafts[conversation.id];
  const hasDraft = Boolean(draftText && draftText.trim().length > 0);

  // Unread badge
  const unreadCount = conversation.unread_count || 0;
  const hasUnread = unreadCount > 0;

  return (
    <div
      onClick={onSelect}
      className={`mx-2 my-0.5 px-3 py-2 rounded-xl flex items-center gap-3 cursor-pointer select-none transition-colors ${
        isActive
          ? "bg-[var(--bg-hover)]"
          : "hover:bg-[var(--bg-hover)]"
      }`}
    >
      <Avatar
        name={displayName}
        color={avatarColor}
        initials={otherUser?.initials}
        isGroup={isGroup}
        isOnline={false}
        size="md"
      />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Row 1: Contact Name and Timestamp */}
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={`truncate text-[14.5px] leading-tight ${
              hasUnread && !hasDraft
                ? "font-bold text-[var(--text-primary)]"
                : "font-semibold text-[var(--text-primary)]"
            }`}
          >
            {displayName}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isPinned && (
              <SignalPinChatIcon className="w-3 h-3 text-[var(--text-muted)] rotate-45 shrink-0" />
            )}
            <span className="text-[11.5px] text-[var(--text-muted)] font-normal">
              {hasDraft
                ? "Now"
                : formatConversationTimestamp(conversation.updated_at || lastMsg?.created_at)}
            </span>
          </div>
        </div>

        {/* Row 2: Message preview and Unread Badge / Outgoing Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {hasDraft ? (
              <span className="text-[13px] leading-tight truncate">
                <span className="italic text-[#9e9e9e]">Draft: </span>
                <span className="text-[#9e9e9e]">{draftText}</span>
              </span>
            ) : isTyping ? (
              <span className="text-xs text-[var(--signal-ultramarine)] font-medium animate-pulse truncate">
                Typing...
              </span>
            ) : lastMsg ? (
              <span className="text-[13px] font-normal text-[var(--text-secondary)] truncate leading-tight">
                {lastMsg.message_type === "poll"
                  ? (() => {
                      try {
                        const p = JSON.parse(lastMsg.content);
                        return `📊 Poll: ${p.question}`;
                      } catch {
                        return "📊 Poll";
                      }
                    })()
                  : lastMsg.content}
              </span>
            ) : (
              <span className="text-[13px] text-[var(--text-muted)] italic">
                No messages yet
              </span>
            )}
          </div>

          {/* Far Right: Unread badge for incoming OR Receipt icon for outgoing */}
          {!hasDraft && (
            hasUnread ? (
              <div className="ml-2 shrink-0 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-[var(--signal-ultramarine)] text-white text-[11px] font-bold rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            ) : isOutgoing && lastMsg ? (
              <span className="ml-2 shrink-0 flex items-center">
                <ReceiptIcon
                  status={lastMsg.status}
                  className={
                    lastMsg.status === "sent"
                      ? "w-[13px] h-[13px] text-[var(--text-muted)]"
                      : "w-[17px] h-[12px] text-[var(--text-muted)]"
                  }
                />
              </span>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

