"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, FileText, ChevronUp, ChevronDown } from "lucide-react";
import { Message } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { EmojiPickerPopover } from "./EmojiPickerPopover";
import {
  SignalPhotoIcon,
  SignalFileIcon,
  SignalPollIcon,
} from "./SignalIcons";
import { PollCreateModal } from "./modals/PollCreateModal";

interface MessageInputProps {
  onSendMessage: (content: string, type?: string, replyTo?: any) => void;
  onTyping: (isTyping: boolean) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

function SignalSendIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

// Authentic Signal Desktop Icons
function SignalEmojiIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.027 12.452a.73.73 0 0 0-1.125.929A5.303 5.303 0 0 0 10 15.312c1.65 0 3.125-.753 4.098-1.931a.73.73 0 0 0-1.125-.929A3.845 3.845 0 0 1 10 13.854a3.845 3.845 0 0 1-2.973-1.402Zm5.681-5.994c-.412 0-.735.251-.936.552a2.025 2.025 0 0 0-.314 1.115c0 .416.112.811.314 1.115.2.3.524.552.936.552.413 0 .736-.251.936-.552.203-.304.314-.699.314-1.115 0-.416-.111-.811-.314-1.115-.2-.3-.523-.552-.936-.552Zm-6.352.552c.2-.3.523-.552.936-.552.412 0 .735.251.936.552.202.304.314.699.314 1.115 0 .416-.112.811-.314 1.115-.2.3-.524.552-.936.552-.413 0-.736-.251-.936-.552a2.025 2.025 0 0 1-.314-1.115c0-.416.111-.811.314-1.115Z"
        fill="currentColor"
      />
      <path
        d="M10 .938a9.063 9.063 0 1 0 0 18.125A9.063 9.063 0 0 0 10 .938ZM2.396 10a7.604 7.604 0 1 1 15.208 0 7.604 7.604 0 0 1-15.208 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SignalMicIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 .938A4.062 4.062 0 0 0 5.937 5v4.583a4.062 4.062 0 1 0 8.125 0V5A4.062 4.062 0 0 0 10 .937ZM7.396 5a2.604 2.604 0 0 1 5.208 0v4.583a2.604 2.604 0 1 1-5.208 0V5Z"
        fill="currentColor"
      />
      <path
        d="M6.458 17.604a.73.73 0 1 0 0 1.459h7.084a.73.73 0 0 0 0-1.459h-2.813v-1.08a6.98 6.98 0 0 0 6.25-6.94V8.75a.73.73 0 0 0-1.458 0v.833a5.52 5.52 0 0 1-11.042 0V8.75a.73.73 0 1 0-1.458 0v.833a6.98 6.98 0 0 0 6.25 6.942v1.08H6.458Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SignalPlusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.73 3.75a.73.73 0 1 0-1.459 0v5.52h-5.52a.73.73 0 0 0 0 1.46h5.52v5.52a.73.73 0 0 0 1.458 0v-5.52h5.521a.73.73 0 0 0 0-1.46h-5.52V3.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

const EMOJI_LIST = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
  "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
  "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
  "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖",
  "👍", "👎", "👏", "🙌", "👐", "🤝", "🙏", "✌️", "🤞", "🤟",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
  "🔥", "✨", "⭐", "🎉", "🎊", "🚀", "💯", "🎈", "🎁", "🏆",
];

export function MessageInput({
  onSendMessage,
  onTyping,
  replyingTo,
  onCancelReply,
}: MessageInputProps) {
  const { activeConversationId, drafts, setDraft } = useAppStore();
  const [content, setContent] = useState(() => {
    return (activeConversationId && drafts[activeConversationId]) || "";
  });
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  const prevConvIdRef = useRef<string | null>(activeConversationId);
  useEffect(() => {
    if (prevConvIdRef.current !== activeConversationId) {
      prevConvIdRef.current = activeConversationId;
      setContent(activeConversationId ? drafts[activeConversationId] || "" : "");
    }
  }, [activeConversationId, drafts]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentTimeRef = useRef<number>(0);

  const stopTyping = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    lastTypingSentTimeRef.current = 0;
    onTyping(false);
  };

  // Auto-resize textarea (caps at 3 lines ~76px in normal mode, 100% in enlarged mode)
  useEffect(() => {
    if (!textareaRef.current) return;
    if (!isEnlarged) {
      textareaRef.current.style.height = "auto";
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 22), 76)}px`;
    } else {
      textareaRef.current.style.height = "100%";
    }
  }, [content, isEnlarged]);

  // Focus textarea and place cursor at end when toggling enlargement
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEnlarged]);

  // Focus textarea when replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  // Ensure typing stops on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopTyping();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      stopTyping();
    };
  }, []);

  // Composer Keyboard Shortcuts: Focus (Ctrl+Shift+T), Expand/Shrink (Ctrl+Shift+K), Emoji (Ctrl+Shift+J)
  useEffect(() => {
    const handleComposerShortcuts = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const key = e.key.toLowerCase();

      // Focus composer: Ctrl + Shift + T
      if (isCtrlOrCmd && isShift && key === "t") {
        e.preventDefault();
        textareaRef.current?.focus();
        return;
      }

      // Expand / shrink composer: Ctrl + Shift + K
      if (isCtrlOrCmd && isShift && key === "k") {
        e.preventDefault();
        setIsEnlarged((prev) => !prev);
        return;
      }

      // Open emoji picker: Ctrl + Shift + J
      if (isCtrlOrCmd && isShift && key === "j") {
        e.preventDefault();
        setShowEmojiPicker((prev) => !prev);
        return;
      }
    };

    window.addEventListener("keydown", handleComposerShortcuts);
    return () => window.removeEventListener("keydown", handleComposerShortcuts);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    if (activeConversationId) {
      setDraft(activeConversationId, val);
    }

    // If input was emptied, stop typing immediately
    if (val.trim() === "") {
      stopTyping();
      return;
    }

    // Send typing notification every 1.5s while actively typing
    const now = Date.now();
    if (now - lastTypingSentTimeRef.current > 1500) {
      lastTypingSentTimeRef.current = now;
      onTyping(true);
    }

    // Debounced 2-second stop: automatically ceases typing after 2 seconds of no keystrokes
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleSend = () => {
    if (!content.trim()) return;

    let replyData = null;
    if (replyingTo) {
      replyData = {
        id: replyingTo.id,
        sender_name: replyingTo.sender?.display_name || "User",
        content: replyingTo.content,
      };
    }

    onSendMessage(content.trim(), "text", replyData);
    setContent("");
    if (activeConversationId) {
      setDraft(activeConversationId, "");
    }
    onCancelReply();
    stopTyping();

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape" && isEnlarged) {
      setIsEnlarged(false);
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    const nextContent = content + emoji;
    setContent(nextContent);
    if (activeConversationId) {
      setDraft(activeConversationId, nextContent);
    }
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const isImage = file.type.startsWith("image/") || file.type.startsWith("video/");
      onSendMessage(result, isImage ? "image" : "file");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setShowAttachmentMenu(false);
  };

  const handleSendPoll = (question: string, options: string[], allowMultiple: boolean) => {
    const pollData = {
      question,
      options,
      allow_multiple: allowMultiple,
      votes: {},
    };
    onSendMessage(JSON.stringify(pollData), "poll");
    setIsPollModalOpen(false);
    stopTyping();
  };

  const hasText = content.length > 0;

  // Render Emoji Button & Popover
  const renderEmojiButton = (
    <div className="relative shrink-0 flex items-center">
      <button
        type="button"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        title="Emoji"
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          showEmojiPicker ? "text-white bg-white/10" : "text-[#9e9e9e] hover:text-white"
        }`}
      >
        <SignalEmojiIcon className="w-5 h-5" />
      </button>

      {showEmojiPicker && (
        <EmojiPickerPopover
          onSelectEmoji={handleSelectEmoji}
          onSendSticker={(stickerUrl) => {
            onSendMessage(stickerUrl, "image");
            setShowEmojiPicker(false);
          }}
          onSendGif={(gifUrl) => {
            onSendMessage(gifUrl, "image");
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );

  // Render Attachment (+) Button & Menu
  const renderAttachmentMenu = (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
        title="Add attachment or poll"
        className={
          isEnlarged
            ? `w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                showAttachmentMenu ? "text-white bg-white/10" : "text-[#9e9e9e] hover:text-white"
              }`
            : `w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                showAttachmentMenu
                  ? "bg-[#3e3e3e] text-white"
                  : "bg-[#2a2a2a] hover:bg-[#353535] text-white"
              }`
        }
      >
        <SignalPlusIcon className="w-5 h-5 stroke-[1.2]" />
      </button>

      {showAttachmentMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowAttachmentMenu(false)}
          />
          <div
            style={{
              width: "185px",
              ...(isEnlarged ? { left: "0px" } : { right: "0px" }),
              bottom: "calc(100% + 10px)",
            }}
            className="absolute bg-[#262626] border border-[#383838]/80 rounded-2xl p-1.5 shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-100 select-none"
          >
            {/* Item 1: Photos & videos */}
            <button
              type="button"
              onClick={() => {
                setShowAttachmentMenu(false);
                mediaInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-normal text-white hover:bg-[#383838] transition-colors cursor-pointer text-left"
            >
              <SignalPhotoIcon className="w-5 h-5 text-white shrink-0" />
              <span className="whitespace-nowrap">Photos &amp; videos</span>
            </button>

            {/* Item 2: File */}
            <button
              type="button"
              onClick={() => {
                setShowAttachmentMenu(false);
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-normal text-white hover:bg-[#383838] transition-colors cursor-pointer text-left"
            >
              <SignalFileIcon className="w-5 h-5 text-white shrink-0" />
              <span className="whitespace-nowrap">File</span>
            </button>

            {/* Item 3: Poll */}
            <button
              type="button"
              onClick={() => {
                setShowAttachmentMenu(false);
                setIsPollModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-normal text-white hover:bg-[#383838] transition-colors cursor-pointer text-left"
            >
              <SignalPollIcon className="w-5 h-5 text-white shrink-0" />
              <span className="whitespace-nowrap">Poll</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="relative bg-[var(--bg-primary)] px-3 pt-3 pb-2 select-none group/composer">
      {/* Replying Banner */}
      {replyingTo && (
        <div
          data-testid="replying-banner"
          className="flex items-center justify-between bg-[#1d3570] border-l-[3.5px] border-[#3c74f5] px-3.5 py-2 rounded-xl mb-2 select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="min-w-0 flex-1">
            <span className="font-bold text-white text-[13.5px] block truncate leading-tight">
              {replyingTo.sender?.display_name || replyingTo.sender?.username || "Unknown"}
            </span>
            <span className="text-white/90 truncate block text-[13px] leading-tight mt-0.5">
              {replyingTo.content}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 text-white/70 hover:text-white rounded-full transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      )}

      {!isEnlarged ? (
        /* ================= NORMAL COMPOSER MODE ================= */
        <div className="flex items-center gap-2">
          {renderEmojiButton}

          {/* Center: Input Pill Capsule with background #323232 */}
          <div className="relative flex-1 min-w-0 group/pill">
            {/* Hover Expand Chevron Up Arrow */}
            <button
              type="button"
              onClick={() => setIsEnlarged(true)}
              title="Enlarge message box"
              data-testid="enlarge-input-button"
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-6 py-1 opacity-0 group-hover/composer:opacity-100 group-hover/pill:opacity-100 hover:opacity-100 transition-opacity duration-150 text-[#8e8e93] hover:text-white flex items-center justify-center cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            <div className="w-full flex items-center bg-[#323232] rounded-[18px] px-3.5 py-1.5 min-h-[36px] max-h-[88px] transition-all">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Message"
                rows={1}
                className="w-full bg-transparent resize-none py-0.5 text-[14px] text-white placeholder-[#8e8e93] focus:outline-hidden min-h-[22px] max-h-[76px] leading-[20px] select-text break-all [word-break:break-word] [overflow-wrap:anywhere] overflow-y-auto"
              />
            </div>
          </div>

          {/* Right: Actions outside capsule */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Microphone Icon (Disabled / Coming soon) */}
            {!hasText && (
              <div className="relative group flex items-center justify-center">
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  aria-label="Record Voice Note"
                  data-testid="mic-button"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#9e9e9e] opacity-60 cursor-default select-none transition-colors"
                >
                  <SignalMicIcon className="w-5 h-5" />
                </button>
                <div
                  data-testid="mic-tooltip"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#262626] text-white text-[12px] font-medium rounded-lg border border-[#3e3e3e] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50"
                >
                  Coming soon
                </div>
              </div>
            )}

            {renderAttachmentMenu}
          </div>
        </div>
      ) : (
        /* ================= ENLARGED COMPOSER MODE ================= */
        <div className="flex flex-col">
          {/* Enlarged Box */}
          <div className="relative w-full group/box mb-2">
            {/* Hover Shrink Chevron Down Arrow */}
            <button
              type="button"
              onClick={() => setIsEnlarged(false)}
              title="Shrink message box"
              data-testid="shrink-input-button"
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-6 py-1 opacity-0 group-hover/composer:opacity-100 group-hover/box:opacity-100 hover:opacity-100 transition-opacity duration-150 text-[#8e8e93] hover:text-white flex items-center justify-center cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            <div className="w-full bg-[#323232] rounded-2xl px-4 py-3 h-[164px] flex flex-col">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Message"
                className="w-full h-full bg-transparent resize-none text-[14px] text-white placeholder-[#8e8e93] focus:outline-hidden leading-[20px] select-text break-all [word-break:break-word] [overflow-wrap:anywhere] overflow-y-auto"
              />
            </div>
          </div>

          {/* Bottom Bar: [😊] [+] on left, circular blue send button on right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {renderEmojiButton}
              {renderAttachmentMenu}
            </div>

            {/* Circular Blue Send Button */}
            <button
              type="button"
              onClick={handleSend}
              title="Send"
              data-testid="send-enlarged-button"
              className="w-8 h-8 rounded-full bg-[#5275fc] hover:bg-[#3d64f4] active:bg-[#2c52e0] flex items-center justify-center text-white cursor-pointer shadow-sm transition-colors shrink-0"
            >
              <SignalSendIcon className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={mediaInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,video/*"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="*/*"
      />

      {/* New Poll Modal */}
      <PollCreateModal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        onSendPoll={handleSendPoll}
      />
    </div>
  );
}
