"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Message } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAppStore } from "@/lib/store";
import { formatMessageTimestamp } from "@/lib/utils";
import { ReceiptIcon } from "./ReceiptIcon";
import { Avatar } from "./Avatar";
import { ForwardToModal } from "./modals/ForwardToModal";
import {
  SignalMoreIcon,
  SignalHeartPlusIcon,
  SignalReplyCurvedIcon,
  SignalForwardCurvedIcon,
  SignalSelectCircleIcon,
  SignalCopyOverlappingIcon,
  SignalPinSlantedIcon,
  SignalInfoLetterIcon,
  SignalTrashCanIcon,
  SignalPencilEditIcon,
} from "./SignalIcons";
import { PollMessageBubble } from "./PollMessageBubble";

interface MessageBubbleProps {
  message: Message;
  isGroup?: boolean;
  isFirstInCluster?: boolean;
  isLastInCluster?: boolean;
  isSingleInCluster?: boolean;
  isStartOfNewCluster?: boolean;
  isSelecting?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onReply?: (message: Message) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onEdit?: (message: Message) => void;
  onOpenInfo?: (message: Message) => void;
}

const SIGNAL_QUICK_REACTIONS = ["❤️", "👍", "👎", "😂", "😮", "😢"];

const EXTRA_EMOJIS = [
  "🎉", "🔥", "🙏", "👏", "🥳", "🤔",
  "💯", "🚀", "😍", "🤩", "✨", "👀",
  "💔", "🤝", "🙌", "💀", "😴", "🫡",
];

const MAX_COLLAPSED_LINES = 8;
const MAX_COLLAPSED_CHARS = 540;

function getTruncatedMessage(content: string) {
  const lines = content.split("\n");
  const isMultiLine = lines.length > MAX_COLLAPSED_LINES;
  const isTooLong = content.length > MAX_COLLAPSED_CHARS;

  if (!isMultiLine && !isTooLong) {
    return { isLong: false, truncatedText: content };
  }

  let text = content;
  if (isMultiLine) {
    text = lines.slice(0, MAX_COLLAPSED_LINES).join("\n");
  }
  if (text.length > MAX_COLLAPSED_CHARS) {
    text = text.slice(0, MAX_COLLAPSED_CHARS);
  }

  return { isLong: true, truncatedText: text };
}

export function MessageBubble({
  message,
  isGroup = false,
  isFirstInCluster = false,
  isLastInCluster = true,
  isSingleInCluster = false,
  isStartOfNewCluster = false,
  isSelecting = false,
  isSelected = false,
  onToggleSelect,
  onReply,
  onReaction,
  onEdit,
  onOpenInfo,
}: MessageBubbleProps) {
  const { user } = useAuth();
  const {
    activeConversation,
    contacts,
    conversations,
    setIsSelectingMessages,
    toggleSelectMessage,
    deleteMessage,
    editMessage,
    togglePinMessage,
    pinnedMessageIds,
    sendMessage,
    votePoll,
    highlightedMessageId,
  } = useAppStore();

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [reactionsOpenBelow, setReactionsOpenBelow] = useState(false);
  const [showExtraEmojis, setShowExtraEmojis] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isLong, truncatedText } = useMemo(
    () => getTruncatedMessage(message.content),
    [message.content]
  );

  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleToggleContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowReactionsMenu(false);
    setShowExtraEmojis(false);
    if (!showContextMenu) {
      const buttonEl = e.currentTarget;
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        const chatContainer = buttonEl.closest(".overflow-y-auto");
        let spaceBelow: number;
        let spaceAbove: number;

        if (chatContainer) {
          const containerRect = chatContainer.getBoundingClientRect();
          spaceBelow = containerRect.bottom - rect.bottom;
          spaceAbove = rect.top - containerRect.top;
        } else {
          spaceBelow = window.innerHeight - rect.bottom - 70;
          spaceAbove = rect.top - 60;
        }

        // Context menu height with 7 items is ~290px
        const MENU_HEIGHT = 290;
        if (spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow) {
          setOpenAbove(true);
        } else {
          setOpenAbove(false);
        }
      }
      setShowContextMenu(true);
    } else {
      setShowContextMenu(false);
    }
  };

  const handleToggleReactionsMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowContextMenu(false);
    if (!showReactionsMenu) {
      const buttonEl = e.currentTarget;
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        const chatContainer = buttonEl.closest(".overflow-y-auto");
        let spaceAbove: number;

        if (chatContainer) {
          const containerRect = chatContainer.getBoundingClientRect();
          spaceAbove = rect.top - containerRect.top;
        } else {
          spaceAbove = rect.top - 60;
        }

        if (spaceAbove < 65) {
          setReactionsOpenBelow(true);
        } else {
          setReactionsOpenBelow(false);
        }
      }
      setShowReactionsMenu(true);
    } else {
      setShowReactionsMenu(false);
      setShowExtraEmojis(false);
    }
  };

  // Ensure dropdown fits after render if space changes
  useEffect(() => {
    if (showContextMenu && contextMenuRef.current) {
      const menuEl = contextMenuRef.current;
      const rect = menuEl.getBoundingClientRect();
      const chatContainer = menuEl.closest(".overflow-y-auto");
      const containerBottom = chatContainer
        ? chatContainer.getBoundingClientRect().bottom
        : window.innerHeight - 60;

      if (!openAbove && rect.bottom > containerBottom) {
        setOpenAbove(true);
      }
    }
  }, [showContextMenu, openAbove]);

  const isOutgoing = user ? message.sender_id === user.id : false;
  const isPinned = pinnedMessageIds?.includes(message.id) ?? false;

  const sender = useMemo(() => {
    if (message.sender) return message.sender;
    const member = activeConversation?.members?.find((m) => m.id === message.sender_id);
    if (member) {
      return {
        id: member.id,
        username: member.username,
        display_name: member.display_name,
        avatar_color: member.avatar_color,
        initials: member.initials,
        avatar_url: member.avatar_url,
      };
    }
    const contact = contacts.find((c) => c.id === message.sender_id);
    if (contact) {
      return {
        id: contact.id,
        username: contact.username,
        display_name: contact.display_name,
        avatar_color: contact.avatar_color,
        initials: contact.initials,
        avatar_url: contact.avatar_url,
      };
    }
    return undefined;
  }, [message.sender, message.sender_id, activeConversation?.members, contacts]);

  const shouldShowAuthor =
    !isOutgoing && isGroup && sender && (isFirstInCluster || isSingleInCluster);

  // System message
  if (message.message_type === "system") {
    return (
      <div className="flex justify-center my-3 select-none">
        <span className="bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-[11px] px-3 py-1 rounded-full text-center max-w-[85%] border border-[var(--border-primary)] shadow-2xs">
          {message.content}
        </span>
      </div>
    );
  }

  const handleCopy = () => {
    let textToCopy = message.content;
    if (message.message_type === "poll") {
      try {
        const parsed = JSON.parse(message.content);
        textToCopy = `${parsed.question}\n${parsed.options
          .map((opt: string, idx: number) => `${idx + 1}. ${opt}`)
          .join("\n")}`;
      } catch {
        textToCopy = message.content;
      }
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasReactions =
    message.reactions && Object.values(message.reactions).some((uids) => uids.length > 0);

  const totalReactionCount = useMemo(() => {
    if (!message.reactions) return 0;
    return Object.values(message.reactions).reduce((acc, uids) => acc + uids.length, 0);
  }, [message.reactions]);

  // Corner rounding based on position in cluster
  let cornerClasses = "";
  if (isOutgoing) {
    if (isSingleInCluster) {
      cornerClasses = "rounded-[18px]";
    } else if (isFirstInCluster) {
      cornerClasses = "rounded-l-[18px] rounded-tr-[18px] rounded-br-[4px]";
    } else if (isLastInCluster) {
      cornerClasses = "rounded-l-[18px] rounded-tr-[4px] rounded-br-[18px]";
    } else {
      cornerClasses = "rounded-l-[18px] rounded-r-[4px]";
    }
  } else {
    if (isSingleInCluster) {
      cornerClasses = "rounded-[18px]";
    } else if (isFirstInCluster) {
      cornerClasses = "rounded-r-[18px] rounded-tl-[18px] rounded-bl-[4px]";
    } else if (isLastInCluster) {
      cornerClasses = "rounded-r-[18px] rounded-tl-[4px] rounded-bl-[18px]";
    } else {
      cornerClasses = "rounded-r-[18px] rounded-l-[4px]";
    }
  }

  // Spacing: cluster margin
  const baseMargin = isStartOfNewCluster
    ? "mt-4 mb-[1px]"
    : isSingleInCluster
    ? "my-2"
    : "my-[1px]";
  const containerMargin = hasReactions ? `${baseMargin} mb-3` : baseMargin;

  const showTimestamp = isLastInCluster || isSingleInCluster;

  return (
    <div
      id={`msg-${message.id}`}
      onClick={isSelecting ? onToggleSelect : undefined}
      className={`group relative flex px-4 ${containerMargin} ${
        isSelecting ? "cursor-pointer" : ""
      } ${isOutgoing ? "justify-end" : "justify-start"}`}
    >
      {/* Selection Circle Checkbox */}
      {isSelecting && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className="mr-3 shrink-0 cursor-pointer self-center"
        >
          {isSelected ? (
            <div className="w-5 h-5 rounded-full bg-[var(--signal-ultramarine)] flex items-center justify-center text-white shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-neutral-500 hover:border-neutral-300 transition-colors" />
          )}
        </button>
      )}

      {/* Sender Avatar Container (Incoming Group Messages) */}
      {!isOutgoing && isGroup && (
        <div className="w-7 mr-2 shrink-0 self-end flex items-end justify-center mb-0.5 select-none">
          {isLastInCluster || isSingleInCluster ? (
            <Avatar
              name={sender?.display_name || "Unknown"}
              color={sender?.avatar_color}
              initials={sender?.initials}
              avatarUrl={sender?.avatar_url}
              size="author"
            />
          ) : (
            <div className="w-7 h-7" aria-hidden="true" />
          )}
        </div>
      )}

      {/* Message Cluster Column */}
      <div
        style={{
          maxWidth: "min(85%, 480px)",
        }}
        className={`flex flex-col min-w-0 ${
          isOutgoing ? "items-end" : "items-start"
        }`}
      >
        {/* Relative Bubble & Actions Wrapper */}
        <div className="relative group max-w-full min-w-0 flex items-center">
          {/* ======================================================== */}
          {/* HOVER ACTION BUTTONS (OUTGOING: Left of bubble)           */}
          {/* Order: ... (more) | ↩ (reply) | ♡+ (react, closest)     */}
          {/* ======================================================== */}
          {!isSelecting && isOutgoing && (
            <div
              className={`absolute right-full mr-2 z-30 transition-opacity duration-150 flex items-center gap-1.5 select-none ${
                showContextMenu || showReactionsMenu
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
              }`}
            >
              {/* 1. Dots Menu Button */}
              <button
                type="button"
                onClick={handleToggleContextMenu}
                title="More actions"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  showContextMenu
                    ? "text-white bg-white/10"
                    : "text-[#8e8e93] hover:text-white"
                }`}
              >
                <SignalMoreIcon className="w-[18px] h-[18px]" />
              </button>

              {/* 2. Reply Button */}
              {onReply && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply(message);
                  }}
                  title="Reply"
                  className="p-1.5 rounded-full text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
                >
                  <SignalReplyCurvedIcon className="w-[18px] h-[18px]" />
                </button>
              )}

              {/* 3. React Button */}
              <button
                type="button"
                onClick={handleToggleReactionsMenu}
                title="React"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  showReactionsMenu
                    ? "text-white bg-white/10"
                    : "text-[#8e8e93] hover:text-white"
                }`}
              >
                <SignalHeartPlusIcon className="w-[19px] h-[19px]" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* MESSAGE BUBBLE BODY                                      */}
          {/* ======================================================== */}
          <div
            style={{
              outline:
                highlightedMessageId === message.id
                  ? "2px solid var(--signal-ultramarine)"
                  : undefined,
              outlineOffset:
                highlightedMessageId === message.id ? "3px" : undefined,
            }}
            className={`relative w-fit px-3.5 py-1.5 [word-break:break-word] [overflow-wrap:anywhere] max-w-full min-w-0 text-sm shadow-2xs select-text transition-all duration-300 ${cornerClasses} ${
              isOutgoing
                ? "bg-[var(--bubble-outgoing)] text-[var(--bubble-outgoing-text)]"
                : "bg-[var(--bubble-incoming)] text-[var(--bubble-incoming-text)]"
            }`}
          >
            {/* Sender display name on top inside the bubble */}
            {shouldShowAuthor && (
              <div
                className="text-[12.5px] font-semibold mb-1 select-none tracking-tight leading-tight cursor-default"
                style={{ color: sender.avatar_color || "#5ca7f3" }}
              >
                {sender.display_name}
              </div>
            )}

            {/* Quoted Reply if present */}
            {message.reply_to && (
              <div
                className={`mb-2 p-2 rounded-lg text-xs border-l-3 ${
                  isOutgoing
                    ? "bg-black/15 border-white/80 text-white/90"
                    : "bg-black/5 border-[var(--signal-ultramarine)] text-[var(--text-secondary)]"
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">
                  {message.reply_to.sender_name}
                </div>
                <div className="truncate opacity-90">
                  {message.reply_to.content}
                </div>
              </div>
            )}

            {/* Attachment Preview if image */}
            {message.message_type === "image" && (
              <div className="rounded-lg overflow-hidden max-w-xs">
                <img
                  src={message.content}
                  alt="Attachment"
                  className="w-full h-auto object-cover max-h-60 rounded-md"
                />
                {showTimestamp && (
                  <div
                    className={`flex justify-end items-center gap-1 mt-1 text-[11px] select-none ${
                      isOutgoing ? "text-white/80" : "text-[var(--text-muted)]"
                    }`}
                  >
                    <span>{formatMessageTimestamp(message.created_at)}</span>
                    {isPinned && (
                      <SignalPinSlantedIcon className="w-3 h-3 text-white/70" />
                    )}
                    {isOutgoing && (
                      <ReceiptIcon
                        status={message.status}
                        className="w-[18px] h-[12px] text-white"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Poll Message Bubble */}
            {message.message_type === "poll" && (
              <PollMessageBubble
                message={message}
                isOutgoing={isOutgoing}
                currentUserId={user?.id}
                onVote={votePoll}
                showTimestamp={showTimestamp}
                isPinned={isPinned}
              />
            )}

            {/* Inline Text Editing Mode */}
            {message.message_type !== "image" && message.message_type !== "poll" && isEditingInline ? (
              <div className="w-full min-w-[220px] flex flex-col gap-2 pt-1 pb-1 select-none">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  className="w-full bg-black/25 text-white text-[14px] p-2 rounded-lg border border-white/20 focus:outline-hidden border-white/20 focus:border-white/50 resize-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (editContent.trim()) {
                        editMessage(message.id, editContent.trim());
                        setIsEditingInline(false);
                      }
                    } else if (e.key === "Escape") {
                      setIsEditingInline(false);
                    }
                  }}
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingInline(false)}
                    className="px-2.5 py-1 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editContent.trim()) {
                        editMessage(message.id, editContent.trim());
                        setIsEditingInline(false);
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : null}

            {/* Standard Message Content & Timestamp */}
            {message.message_type !== "image" && message.message_type !== "poll" && !isEditingInline && (
              <div
                className={`flex flex-wrap items-baseline gap-x-2.5 min-w-0 max-w-full ${
                  isOutgoing ? "justify-end" : "justify-start"
                }`}
              >
                <span className="whitespace-pre-wrap leading-snug text-[14px] self-start mr-auto [word-break:break-word] [overflow-wrap:anywhere]">
                  {isLong && !isExpanded ? truncatedText : message.content}
                  {isLong && !isExpanded && (
                    <span className="select-none inline">
                      <span>... </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(true);
                        }}
                        className="font-bold text-white hover:underline cursor-pointer inline-block ml-0.5 align-baseline"
                      >
                        Read more
                      </button>
                    </span>
                  )}
                  {isLong && isExpanded && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                      }}
                      className="font-bold text-white/90 hover:underline cursor-pointer select-none inline-block ml-1.5 align-baseline"
                    >
                      Read less
                    </button>
                  )}
                </span>
                {showTimestamp && (
                  <span
                    className={`inline-flex items-center gap-1 shrink-0 text-[11px] select-none self-end pb-[0.5px] ml-auto ${
                      isOutgoing ? "text-white/80" : "text-[var(--text-muted)]"
                    }`}
                  >
                    <span>{formatMessageTimestamp(message.created_at)}</span>
                    {message.is_edited && (
                      <span className="text-[10px] opacity-75">edited</span>
                    )}
                    {isPinned && (
                      <SignalPinSlantedIcon className="w-3 h-3 text-white/70" />
                    )}
                    {isOutgoing && (
                      <ReceiptIcon
                        status={message.status}
                        className="w-[18px] h-[12px] text-white"
                      />
                    )}
                  </span>
                )}
              </div>
            )}

            {/* Reacted Emojis Overlapping Badge (Matching Signal Desktop media_1788829971779.png) */}
            {hasReactions && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // If user already reacted with an emoji, toggle it off; otherwise open reaction menu
                  const userReactionEntry = Object.entries(message.reactions!).find(([_, uids]) =>
                    user ? uids.includes(user.id) : false
                  );
                  if (userReactionEntry) {
                    onReaction?.(message.id, userReactionEntry[0]);
                  } else {
                    handleToggleReactionsMenu(e);
                  }
                }}
                title={Object.entries(message.reactions!)
                  .filter(([_, uids]) => uids.length > 0)
                  .map(([emoji, uids]) => `${emoji} ${uids.length}`)
                  .join(", ")}
                className={`absolute z-20 -bottom-2.5 ${
                  isOutgoing ? "-left-1" : "-right-1"
                } flex items-center gap-1 ${
                  totalReactionCount === 1 ? "w-[24px] h-[24px] justify-center" : "px-1.5 py-0.5"
                } rounded-full bg-[#3f3f3f] hover:bg-[#4a4a4a] border-2 border-[var(--bg-primary)] shadow-md cursor-pointer transition-transform hover:scale-110 select-none`}
              >
                {Object.entries(message.reactions!)
                  .filter(([_, uids]) => uids.length > 0)
                  .map(([emoji]) => (
                    <span key={emoji} className="text-[13px] leading-none">
                      {emoji}
                    </span>
                  ))}
                {totalReactionCount > 1 && (
                  <span className="text-[11px] font-semibold text-white/90 leading-none pl-0.5">
                    {totalReactionCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* ======================================================== */}
          {/* HOVER ACTION BUTTONS (INCOMING: Right of bubble)          */}
          {/* Order: ♡+ (react, closest) | ↩ (reply) | ... (more)     */}
          {/* ======================================================== */}
          {!isSelecting && !isOutgoing && (
            <div
              className={`absolute left-full ml-2 z-30 transition-opacity duration-150 flex items-center gap-1.5 select-none ${
                showContextMenu || showReactionsMenu
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
              }`}
            >
              {/* 1. React Button */}
              <button
                type="button"
                onClick={handleToggleReactionsMenu}
                title="React"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  showReactionsMenu
                    ? "text-white bg-white/10"
                    : "text-[#8e8e93] hover:text-white"
                }`}
              >
                <SignalHeartPlusIcon className="w-[19px] h-[19px]" />
              </button>

              {/* 2. Reply Button */}
              {onReply && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply(message);
                  }}
                  title="Reply"
                  className="p-1.5 rounded-full text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
                >
                  <SignalReplyCurvedIcon className="w-[18px] h-[18px]" />
                </button>
              )}

              {/* 3. Dots Menu Button */}
              <button
                type="button"
                onClick={handleToggleContextMenu}
                title="More actions"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  showContextMenu
                    ? "text-white bg-white/10"
                    : "text-[#8e8e93] hover:text-white"
                }`}
              >
                <SignalMoreIcon className="w-[18px] h-[18px]" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* CONTEXT MENU POPUP (Clicked Dots ...)                    */}
          {/* Exact order: Forward, Edit, Select, Copy text, Pin,      */}
          {/* Info, Delete                                            */}
          {/* ======================================================== */}
          {showContextMenu && (
            <>
              {/* Invisible Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContextMenu(false);
                }}
              />

              <div
                ref={contextMenuRef}
                className={`absolute ${
                  isOutgoing ? "right-full mr-2" : "left-full ml-2"
                } ${
                  openAbove
                    ? isOutgoing
                      ? "bottom-0 origin-bottom-right"
                      : "bottom-0 origin-bottom-left"
                    : isOutgoing
                    ? "top-0 origin-top-right"
                    : "top-0 origin-top-left"
                } z-50 bg-[#262626] border border-[#383838] rounded-2xl p-1.5 shadow-2xl w-[185px] select-none animate-in fade-in zoom-in-95 duration-100`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Forward */}
                <button
                  type="button"
                  onClick={() => {
                    setShowContextMenu(false);
                    setIsForwardOpen(true);
                  }}
                  className="w-full flex items-center gap-3.5 px-3 py-2 text-[13.5px] text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <SignalForwardCurvedIcon className="w-[18px] h-[18px] text-white/90 shrink-0" />
                  <span>Forward</span>
                </button>

                {/* 2. Edit (Outgoing text messages) */}
                {isOutgoing && message.message_type !== "image" && message.message_type !== "poll" && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowContextMenu(false);
                      if (onEdit) {
                        onEdit(message);
                      } else {
                        setIsEditingInline(true);
                        setEditContent(message.content);
                      }
                    }}
                    className="w-full flex items-center gap-3.5 px-3 py-2 text-[13.5px] text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <SignalPencilEditIcon className="w-[18px] h-[18px] text-white/90 shrink-0" />
                    <span>Edit</span>
                  </button>
                )}

                {/* 3. Select */}
                <button
                  type="button"
                  onClick={() => {
                    setShowContextMenu(false);
                    setIsSelectingMessages(true);
                    toggleSelectMessage(message.id);
                  }}
                  className="w-full flex items-center gap-3.5 px-3 py-2 text-[13.5px] text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <SignalSelectCircleIcon className="w-[18px] h-[18px] text-white/90 shrink-0" />
                  <span>Select</span>
                </button>

                {/* 4. Copy text */}
                <button
                  type="button"
                  onClick={() => {
                    handleCopy();
                    setShowContextMenu(false);
                  }}
                  className="w-full flex items-center gap-3.5 px-3 py-2 text-[13.5px] text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <SignalCopyOverlappingIcon className="w-[18px] h-[18px] text-white/90 shrink-0" />
                  <span>Copy text</span>
                </button>

                {/* 5. Pin */}
                <button
                  type="button"
                  onClick={() => {
                    togglePinMessage(message.id);
                    setShowContextMenu(false);
                  }}
                  className="w-full flex items-center gap-3.5 px-3 py-2 text-[13.5px] text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <SignalPinSlantedIcon className="w-[18px] h-[18px] text-white/90 shrink-0" />
                  <span>{isPinned ? "Unpin" : "Pin"}</span>
                </button>

                {/* 6. Info */}
                <button
                  type="button"
                  onClick={() => {
                    setShowContextMenu(false);
                    if (onOpenInfo) {
                      onOpenInfo(message);
                    } else {
                      setIsInfoOpen(true);
                    }
                  }}
                  className="w-full flex items-center gap-3.5 px-3 py-2 text-[13.5px] text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <SignalInfoLetterIcon className="w-[18px] h-[18px] text-white/90 shrink-0" />
                  <span>Info</span>
                </button>

                {/* 7. Delete */}
                <button
                  type="button"
                  onClick={() => {
                    setShowContextMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-3.5 px-3 py-2 text-[13.5px] text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <SignalTrashCanIcon className="w-[18px] h-[18px] text-white/90 shrink-0" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* REACTION BAR POPUP (Clicked ♡+)                           */}
          {/* Pill with 6 emojis + circular ... for extra palette      */}
          {/* ======================================================== */}
          {showReactionsMenu && (
            <>
              {/* Invisible Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReactionsMenu(false);
                  setShowExtraEmojis(false);
                }}
              />

              <div
                className={`absolute ${
                  reactionsOpenBelow ? "top-full mt-2 origin-top" : "bottom-full mb-2 origin-bottom"
                } ${
                  isOutgoing ? "right-0" : "left-0"
                } z-50 bg-[#2b2b2b] border border-[#3d3d3d] rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-2.5 select-none animate-in fade-in zoom-in-95 duration-100`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 6 authentic Signal quick reaction emojis */}
                {SIGNAL_QUICK_REACTIONS.map((emoji) => {
                  const isSelected = user && message.reactions?.[emoji]?.includes(user.id);
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReaction?.(message.id, emoji);
                        setShowReactionsMenu(false);
                        setShowExtraEmojis(false);
                      }}
                      className={`text-[22px] leading-none hover:scale-125 transition-transform p-0.5 rounded-full cursor-pointer ${
                        isSelected ? "bg-white/25 scale-110" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}

                {/* 7th item: Circular ... button to open full emoji palette */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExtraEmojis((prev) => !prev);
                  }}
                  title="More reactions"
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white/90 cursor-pointer transition-colors shrink-0 ${
                    showExtraEmojis ? "bg-[#555555]" : "bg-[#444444] hover:bg-[#505050]"
                  }`}
                >
                  <SignalMoreIcon className="w-3.5 h-3.5" />
                </button>

                {/* Extended Reaction Emojis Floating Palette */}
                {showExtraEmojis && (
                  <div
                    className={`absolute ${
                      reactionsOpenBelow ? "top-full mt-2 origin-top" : "bottom-full mb-2 origin-bottom"
                    } ${
                      isOutgoing ? "right-0" : "left-0"
                    } bg-[#2b2b2b] border border-[#3d3d3d] rounded-2xl p-2.5 shadow-2xl grid grid-cols-6 gap-1.5 z-50 w-[240px] animate-in fade-in zoom-in-95 duration-100`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {EXTRA_EMOJIS.map((emoji) => {
                      const isSelected = user && message.reactions?.[emoji]?.includes(user.id);
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReaction?.(message.id, emoji);
                            setShowReactionsMenu(false);
                            setShowExtraEmojis(false);
                          }}
                          className={`text-[20px] p-1.5 rounded-lg hover:bg-white/10 hover:scale-125 transition-all flex items-center justify-center cursor-pointer ${
                            isSelected ? "bg-white/25 ring-1 ring-white/50" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MESSAGE INFO MODAL                                       */}
      {/* ======================================================== */}
      {isInfoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsInfoOpen(false)}
        >
          <div
            className="bg-[#242424] border border-[#383838] rounded-2xl p-5 w-full max-w-[380px] shadow-2xl text-left select-none animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#383838]">
              <h3 className="text-white text-[16px] font-semibold">Message info</h3>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message preview */}
            <div className="py-4 border-b border-[#383838]">
              <div className="text-xs text-neutral-400 mb-1.5">Content</div>
              <div className="text-white text-sm bg-[#1b1b1b] p-3 rounded-xl border border-[#333333] whitespace-pre-wrap max-h-32 overflow-y-auto">
                {message.content}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="pt-4 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-2">
                  <ReceiptIcon status="read" className="w-4 h-4 text-[#2c6bed]" />
                  Read
                </span>
                <span className="text-neutral-200">
                  {formatMessageTimestamp(message.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-2">
                  <ReceiptIcon status="delivered" className="w-4 h-4 text-neutral-400" />
                  Delivered
                </span>
                <span className="text-neutral-200">
                  {formatMessageTimestamp(message.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-2">
                  <ReceiptIcon status="sent" className="w-4 h-4 text-neutral-400" />
                  Sent
                </span>
                <span className="text-neutral-200">
                  {formatMessageTimestamp(message.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORWARD MESSAGE MODAL                                    */}
      {/* ======================================================== */}
      <ForwardToModal
        message={message}
        isOpen={isForwardOpen}
        onClose={() => setIsForwardOpen(false)}
      />

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL                                */}
      {/* ======================================================== */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-[#242424] border border-[#383838] rounded-2xl p-5 w-full max-w-[360px] shadow-2xl text-left select-none animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-[16px] font-semibold mb-2">Delete message?</h3>
            <p className="text-[#a1a1aa] text-[13.5px] leading-relaxed mb-5">
              {isOutgoing
                ? "This message will be deleted for everyone in this chat."
                : "This message will be deleted for you."}
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-[13.5px] font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMessage(message.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-[13.5px] font-medium bg-[#ea4335] hover:bg-[#d9382b] text-white transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
