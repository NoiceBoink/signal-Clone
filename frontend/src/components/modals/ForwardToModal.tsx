"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Check, ArrowRight, Users } from "lucide-react";
import { Message } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Avatar } from "../Avatar";

interface ForwardToModalProps {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
}

export function ForwardToModal({ message, isOpen, onClose }: ForwardToModalProps) {
  const { user } = useAuth();
  const { conversations, contacts, sendMessage } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Build unified list of forward targets (conversations + contacts)
  const forwardTargets = useMemo(() => {
    const list: {
      id: string;
      name: string;
      isGroup: boolean;
      avatarColor?: string | null;
      initials?: string;
      avatarUrl?: string | null;
      conversationId?: string;
    }[] = [];

    // Add active conversations
    conversations.forEach((c) => {
      if (c.is_group) {
        list.push({
          id: c.id,
          name: c.group_name || "Group",
          isGroup: true,
          avatarColor: c.group_avatar_color || "#5468ff",
          conversationId: c.id,
        });
      } else {
        const other = c.members?.find((m) => m.id !== user?.id);
        if (other) {
          list.push({
            id: c.id,
            name: other.display_name || other.username,
            isGroup: false,
            avatarColor: other.avatar_color,
            initials: other.initials,
            avatarUrl: other.avatar_url,
            conversationId: c.id,
          });
        }
      }
    });

    // Add contacts that don't have an active conversation
    contacts.forEach((contact) => {
      const existing = list.some(
        (item) => !item.isGroup && item.name === contact.display_name
      );
      if (!existing && contact.id !== user?.id) {
        list.push({
          id: `contact-${contact.id}`,
          name: contact.display_name || contact.username,
          isGroup: false,
          avatarColor: contact.avatar_color,
          initials: contact.initials,
          avatarUrl: contact.avatar_url,
        });
      }
    });

    return list;
  }, [conversations, contacts, user]);

  // Filtered by search
  const filteredTargets = useMemo(() => {
    if (!searchQuery.trim()) return forwardTargets;
    const q = searchQuery.toLowerCase();
    return forwardTargets.filter((item) => item.name.toLowerCase().includes(q));
  }, [forwardTargets, searchQuery]);

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Selected names comma separated
  const selectedNames = useMemo(() => {
    return forwardTargets
      .filter((item) => selectedIds.includes(item.id))
      .map((item) => item.name);
  }, [forwardTargets, selectedIds]);

  // Handle forward send
  const handleForward = async () => {
    if (selectedIds.length === 0 || isSending) return;
    setIsSending(true);

    try {
      for (const target of forwardTargets) {
        if (selectedIds.includes(target.id)) {
          // If already a conversation, send message
          if (target.conversationId) {
            await sendMessage(message.content, message.message_type);
          }
        }
      }
      onClose();
      setSelectedIds([]);
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to forward:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#242424] border border-[#383838] rounded-2xl p-5 w-full max-w-[380px] shadow-2xl text-left select-none animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title "Forward To" + "X" button */}
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-white text-[17px] font-semibold">Forward To</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar with placeholder "Name, username, or number" */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Name, username, or number"
            className="w-full bg-[#333333] text-white text-[13.5px] pl-10 pr-3.5 py-2 rounded-xl border border-transparent focus:border-[#5468ff] focus:outline-hidden placeholder:text-neutral-400"
            autoFocus
          />
        </div>

        {/* List of Contacts and Groups */}
        <div className="overflow-y-auto space-y-1 my-1 max-h-[280px] pr-1">
          {filteredTargets.map((target) => {
            const isSelected = selectedIds.includes(target.id);
            return (
              <div
                key={target.id}
                onClick={() => toggleSelect(target.id)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer select-none"
              >
                {/* Left: Avatar + Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {target.isGroup ? (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: target.avatarColor || "#455a64",
                        color: "#ffffff",
                      }}
                    >
                      <Users className="w-5 h-5" />
                    </div>
                  ) : (
                    <Avatar
                      name={target.name}
                      color={target.avatarColor}
                      initials={target.initials}
                      avatarUrl={target.avatarUrl}
                      size="sm"
                      className="w-10 h-10 shrink-0"
                    />
                  )}
                  <span className="text-white text-[14.5px] font-medium truncate">
                    {target.name}
                  </span>
                </div>

                {/* Right: Circular Selection Checkbox */}
                <div className="ml-3 shrink-0">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-[#5468ff] flex items-center justify-center text-white shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-neutral-600 hover:border-neutral-400 transition-colors" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Selected list on left, Blue arrow button on right */}
        <div className="flex items-center justify-between pt-3 border-t border-[#333333] mt-2">
          <div className="text-xs text-neutral-300 truncate max-w-[260px]">
            {selectedNames.length > 0 ? selectedNames.join(", ") : ""}
          </div>

          <button
            type="button"
            disabled={selectedIds.length === 0 || isSending}
            onClick={handleForward}
            className="w-10 h-10 rounded-full bg-[#5468ff] hover:bg-[#4357ee] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0 ml-auto"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
}

