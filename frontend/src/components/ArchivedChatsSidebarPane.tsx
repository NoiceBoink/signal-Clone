"use client";

import React from "react";
import { ChevronLeft, Archive } from "lucide-react";
import { Conversation } from "@/lib/api";
import { ChatListItem } from "./ChatListItem";

interface ArchivedChatsSidebarPaneProps {
  onBack: () => void;
  archivedConversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ArchivedChatsSidebarPane({
  onBack,
  archivedConversations,
  activeConversationId,
  onSelectConversation,
}: ArchivedChatsSidebarPaneProps) {
  return (
    <div className="w-[310px] md:w-[330px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border-primary)] flex flex-col h-full select-none relative">
      {/* Header: Back Chevron & Centered 'Archived chats' Title */}
      <div className="px-3 pt-3 pb-2 flex items-center relative border-b border-[var(--border-primary)]/40">
        <button
          type="button"
          onClick={onBack}
          title="Back"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center font-bold text-[16px] text-white pr-8">
          Archived chats
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {archivedConversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center mb-3">
              <Archive className="w-8 h-8 text-[var(--text-muted)]" strokeWidth={1.5} />
            </div>
            <div className="text-[15px] font-medium text-white mb-1">
              No archived chats
            </div>
            <div className="text-xs text-[var(--text-muted)] max-w-[200px]">
              Chats you archive will appear here.
            </div>
          </div>
        ) : (
          <div className="py-1">
            {archivedConversations.map((conv) => (
              <ChatListItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversationId === conv.id}
                onSelect={() => onSelectConversation(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
